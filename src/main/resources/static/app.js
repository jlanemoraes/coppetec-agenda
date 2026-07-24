"use strict";

const API_URL = "/api/contatos";
const LOGIN_URL = "/login";
const LOGOUT_URL = "/logout";
const CSRF_URL = "/csrf";
const SESSION_URL = "/session";
const PHONE_PREFIX = "3622";
const CONTACTS_PER_PAGE = 30;

const state = {
    contatos: [],
    query: "",
    managementFilter: "",
    departmentFilter: "",
    sortKey: "gerencia",
    sortDirection: "ascending",
    visibleLimit: CONTACTS_PER_PAGE,
    isAdmin: false,
    csrfToken: null,
    csrfHeader: "X-XSRF-TOKEN",
    pendingDeleteId: null,
    lastFocusedElement: null,
    initialContactForm: ""
};

const elements = {
    search: document.querySelector("#inputBusca"),
    clearSearch: document.querySelector("#btnLimparBusca"),
    clearEmpty: document.querySelector("#btnLimparEstadoVazio"),
    toggleFilters: document.querySelector("#btnAlternarFiltros"),
    filterPanel: document.querySelector("#painelFiltros"),
    filterCount: document.querySelector("#contadorFiltros"),
    activeFilters: document.querySelector("#filtrosAtivos"),
    activeFilterList: document.querySelector("#listaFiltrosAtivos"),
    managementFilter: document.querySelector("#filtroGerencia"),
    departmentFilter: document.querySelector("#filtroSetor"),
    clearFilters: document.querySelector("#btnLimparFiltros"),
    retry: document.querySelector("#btnTentarNovamente"),
    count: document.querySelector("#contadorContatos"),
    countDescription: document.querySelector("#descricaoResultados"),
    loading: document.querySelector("#estadoCarregamento"),
    empty: document.querySelector("#estadoVazio"),
    error: document.querySelector("#estadoErro"),
    tableWrapper: document.querySelector("#tabelaWrapper"),
    tableBody: document.querySelector("#corpoTabela"),
    cards: document.querySelector("#listaCartoes"),
    loadMoreArea: document.querySelector("#areaCarregarMais"),
    loadMore: document.querySelector("#btnCarregarMais"),
    paginationSummary: document.querySelector("#resumoPaginacao"),
    backToTop: document.querySelector("#btnVoltarTopo"),
    loginModal: document.querySelector("#loginModal"),
    contactModal: document.querySelector("#contatoModal"),
    confirmModal: document.querySelector("#confirmacaoModal"),
    loginForm: document.querySelector("#login-form"),
    contactForm: document.querySelector("#contato-form"),
    loginError: document.querySelector("#erro-mensagem"),
    contactError: document.querySelector("#erro-contato"),
    adminLogin: document.querySelector("#btnAbrirLogin"),
    addContact: document.querySelector("#btnNovoContato"),
    logout: document.querySelector("#btnLogout"),
    adminStatus: document.querySelector("#adminStatus"),
    adminToolbar: document.querySelector("#barraAdministrativa"),
    adminCount: document.querySelector("#contadorAdmin"),
    modalTitle: document.querySelector("#modalTitulo"),
    saveContact: document.querySelector("#btnSalvarContato"),
    confirmText: document.querySelector("#confirmacaoTexto"),
    confirmName: document.querySelector("#confirmacaoNome"),
    confirmArea: document.querySelector("#confirmacaoArea"),
    confirmExtension: document.querySelector("#confirmacaoRamal"),
    confirmDelete: document.querySelector("#btnConfirmarExclusao"),
    unsavedIndicator: document.querySelector("#indicadorAlteracoes"),
    extensionCounter: document.querySelector("#contadorRamal"),
    toastRegion: document.querySelector("#toastRegion")
};

const collator = new Intl.Collator("pt-BR", {
    sensitivity: "base",
    numeric: true
});

function normalize(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .trim();
}

function getVisibleContacts() {
    const query = normalize(state.query);
    const filtered = state.contatos.filter((contact) => {
        const matchesManagement = !state.managementFilter
            || contact.gerencia === state.managementFilter;
        const matchesDepartment = !state.departmentFilter
            || contact.setor === state.departmentFilter;
        const matchesQuery = !query || (() => {
            const searchable = [
                contact.gerencia,
                contact.setor,
                contact.usuario,
                contact.ramal,
                `${PHONE_PREFIX}${contact.ramal}`
            ].map(normalize).join(" ");
            return searchable.includes(query);
        })();
        return matchesManagement && matchesDepartment && matchesQuery;
    });

    return filtered.sort((a, b) => {
        const result = collator.compare(a[state.sortKey] ?? "", b[state.sortKey] ?? "");
        return state.sortDirection === "ascending" ? result : -result;
    });
}

function createIcon(path) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    path.forEach((definition) => {
        const node = document.createElementNS("http://www.w3.org/2000/svg", definition.type || "path");
        Object.entries(definition.attributes).forEach(([name, value]) => node.setAttribute(name, value));
        svg.append(node);
    });
    return svg;
}

function createRamal() {
    const value = document.createElement("span");
    value.className = "ramal-value";
    const prefix = document.createElement("small");
    prefix.textContent = `${PHONE_PREFIX}-`;
    value.append(prefix, document.createTextNode(""));
    return value;
}

function setRamalValue(element, ramal) {
    element.append(document.createTextNode(String(ramal ?? "")));
}

function isLeadershipContact(contact) {
    const role = normalize(contact.setor);
    const management = normalize(contact.gerencia);
    const leadershipRole = /\b(gerente|coordenador|coordenadora|diretora superintendente|superintendencia|diretor executivo)\b/;
    const excludedDirectorateRoles = ["secretaria", "sala de reuniao"];
    return leadershipRole.test(role)
        || (management === "diretoria" && !excludedDirectorateRoles.includes(role));
}

function createActionButton(label, type, contact) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `icon-button${type === "delete" ? " icon-button-danger" : ""}`;
    button.setAttribute("aria-label", `${label} ${contact.usuario || "contato"}`);
    button.dataset.action = type;
    button.dataset.id = String(contact.id);

    let icon;
    if (type === "edit") {
        icon = createIcon([{ attributes: { d: "m14 5 5 5M4 20l4.2-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" } }]);
    } else if (type === "copy") {
        icon = createIcon([
            { attributes: { d: "M9 9h10v10H9z" } },
            { attributes: { d: "M15 9V5H5v10h4" } }
        ]);
        button.classList.add("copy-ramal");
    } else {
        icon = createIcon([
            { attributes: { d: "M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" } },
            { attributes: { d: "M10 11v5M14 11v5" } }
        ]);
    }

    button.append(icon);
    return button;
}

function menuIcon(type) {
    if (type === "edit") {
        return createIcon([{ attributes: { d: "m14 5 5 5M4 20l4.2-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" } }]);
    }
    if (type === "copy") {
        return createIcon([
            { attributes: { d: "M9 9h10v10H9z" } },
            { attributes: { d: "M15 9V5H5v10h4" } }
        ]);
    }
    return createIcon([
        { attributes: { d: "M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" } },
        { attributes: { d: "M10 11v5M14 11v5" } }
    ]);
}

function createMenuItem(label, type, contact) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `action-menu-item${type === "delete" ? " action-menu-item-danger" : ""}`;
    item.dataset.action = type;
    item.dataset.id = String(contact.id);
    item.append(menuIcon(type), document.createTextNode(label));
    return item;
}

function createActionMenu(contact) {
    const wrap = document.createElement("div");
    wrap.className = "action-menu-wrap";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "icon-button";
    trigger.dataset.action = "menu";
    trigger.dataset.id = String(contact.id);
    trigger.setAttribute("aria-label", `Ações para ${contact.usuario || "contato"}`);
    trigger.setAttribute("aria-expanded", "false");
    trigger.append(createIcon([
        { type: "circle", attributes: { cx: "5", cy: "12", r: "1" } },
        { type: "circle", attributes: { cx: "12", cy: "12", r: "1" } },
        { type: "circle", attributes: { cx: "19", cy: "12", r: "1" } }
    ]));

    const menu = document.createElement("div");
    menu.className = "action-menu";
    menu.hidden = true;
    menu.append(
        createMenuItem("Editar contato", "edit", contact),
        createMenuItem("Copiar telefone", "copy", contact),
        createMenuItem("Excluir contato", "delete", contact)
    );
    wrap.append(trigger, menu);
    return wrap;
}

function createTableRow(contact, startsManagementGroup = false) {
    const row = document.createElement("tr");
    if (startsManagementGroup) {
        row.classList.add("management-group-start");
    }
    if (isLeadershipContact(contact)) {
        row.classList.add("leadership-contact");
    }

    const managementCell = document.createElement("td");
    const managementText = document.createElement("span");
    managementText.className = "cell-text";
    managementText.textContent = contact.gerencia || "—";
    managementText.title = contact.gerencia || "";
    managementCell.append(managementText);

    const departmentCell = document.createElement("td");
    const departmentText = document.createElement("span");
    departmentText.className = "cell-text";
    departmentText.textContent = contact.setor || "—";
    departmentText.title = contact.setor || "";
    departmentCell.append(departmentText);

    const userCell = document.createElement("td");
    const userText = document.createElement("span");
    userText.className = "cell-text contact-name";
    userText.textContent = contact.usuario || "—";
    userText.title = contact.usuario || "";
    userCell.append(userText);

    const extensionCell = document.createElement("td");
    extensionCell.className = "ramal-cell";
    const ramal = createRamal();
    setRamalValue(ramal, contact.ramal);
    extensionCell.append(ramal, createActionButton("Copiar ramal de", "copy", contact));

    row.append(managementCell, departmentCell, userCell, extensionCell);

    if (state.isAdmin) {
        const actionsCell = document.createElement("td");
        actionsCell.className = "actions-cell";
        actionsCell.append(createActionMenu(contact));
        row.append(actionsCell);
    }

    return row;
}

function createCardAction(label, type, contact, className = "button button-secondary card-action") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.action = type;
    button.dataset.id = String(contact.id);
    button.textContent = label;
    return button;
}

function createContactCard(contact, startsManagementGroup = false) {
    const card = document.createElement("article");
    card.className = "contact-card";
    if (startsManagementGroup) {
        card.classList.add("management-group-start");
    }
    if (isLeadershipContact(contact)) {
        card.classList.add("leadership-contact");
    }

    const top = document.createElement("div");
    top.className = "contact-card-top";

    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = contact.usuario || "Contato sem nome";
    const details = document.createElement("p");
    details.textContent = [contact.gerencia, contact.setor].filter(Boolean).join(" · ") || "Sem setor informado";
    copy.append(title, details);

    const ramal = createRamal();
    setRamalValue(ramal, contact.ramal);
    top.append(copy, ramal);
    card.append(top);

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
        createCardAction("Copiar telefone", "copy", contact, "button card-action card-action-primary")
    );

    const callLink = document.createElement("a");
    callLink.className = "button button-secondary card-action";
    callLink.href = `tel:+5521${PHONE_PREFIX}${contact.ramal || ""}`;
    callLink.textContent = "Ligar";
    callLink.setAttribute("aria-label", `Ligar para ${contact.usuario || "contato"}`);
    actions.append(callLink);

    if (state.isAdmin) {
        actions.append(
            createCardAction("Editar", "edit", contact),
            createCardAction("Excluir", "delete", contact, "button button-secondary card-action")
        );
    }
    card.append(actions);

    return card;
}

function updateSortIndicators() {
    document.querySelectorAll(".sort-button").forEach((button) => {
        const header = button.closest("th");
        const active = button.dataset.sort === state.sortKey;
        header.setAttribute("aria-sort", active ? state.sortDirection : "none");
    });
}

function updateResultsMeta(resultCount, displayedCount) {
    const total = state.contatos.length;
    const hasRefinement = state.query || state.managementFilter || state.departmentFilter;
    const contactLabel = resultCount === 1 ? "contato" : "contatos";
    elements.count.textContent = `${resultCount} ${contactLabel}`;
    elements.countDescription.textContent = hasRefinement
        ? `encontrados em ${total}`
        : "disponíveis na agenda interna";
    elements.paginationSummary.textContent = `Exibindo ${displayedCount} de ${resultCount} ${contactLabel}`;
    elements.adminCount.textContent = `${state.contatos.length} ${state.contatos.length === 1 ? "contato" : "contatos"}`;
}

function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => collator.compare(a, b));
}

function replaceSelectOptions(select, values, emptyLabel, selectedValue) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = emptyLabel;
    const options = values.map((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        return option;
    });
    select.replaceChildren(emptyOption, ...options);
    select.value = values.includes(selectedValue) ? selectedValue : "";
}

function updateFilterOptions() {
    const managements = uniqueSorted(state.contatos.map((contact) => contact.gerencia));
    replaceSelectOptions(
        elements.managementFilter,
        managements,
        "Todas as gerências",
        state.managementFilter
    );

    const contactsInManagement = state.managementFilter
        ? state.contatos.filter((contact) => contact.gerencia === state.managementFilter)
        : state.contatos;
    const departments = uniqueSorted(contactsInManagement.map((contact) => contact.setor));
    if (!departments.includes(state.departmentFilter)) {
        state.departmentFilter = "";
    }
    replaceSelectOptions(
        elements.departmentFilter,
        departments,
        "Todos os setores",
        state.departmentFilter
    );
}

function createFilterChip(label, filterName) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip";
    chip.dataset.clearFilter = filterName;
    chip.setAttribute("aria-label", `Remover filtro ${label}`);

    const text = document.createElement("span");
    text.textContent = label;
    const icon = createIcon([{ attributes: { d: "m7 7 10 10M17 7 7 17" } }]);
    chip.append(text, icon);
    return chip;
}

function updateFilterPresentation() {
    const chips = [];
    if (state.managementFilter) {
        chips.push(createFilterChip(`Gerência: ${state.managementFilter}`, "management"));
    }
    if (state.departmentFilter) {
        chips.push(createFilterChip(`Setor: ${state.departmentFilter}`, "department"));
    }

    const count = chips.length;
    elements.activeFilterList.replaceChildren(...chips);
    elements.activeFilters.hidden = count === 0;
    elements.filterCount.hidden = count === 0;
    elements.filterCount.textContent = String(count);
    elements.clearFilters.hidden = count === 0;
}

function renderContacts() {
    const contacts = getVisibleContacts();
    const displayedContacts = contacts.slice(0, state.visibleLimit);
    const separatesManagements = state.sortKey === "gerencia";
    const startsGroup = (contact, index) => separatesManagements
        && index > 0
        && contact.gerencia !== displayedContacts[index - 1].gerencia;

    elements.tableBody.replaceChildren(
        ...displayedContacts.map((contact, index) => createTableRow(contact, startsGroup(contact, index)))
    );
    elements.cards.replaceChildren(
        ...displayedContacts.map((contact, index) => createContactCard(contact, startsGroup(contact, index)))
    );

    const hasResults = contacts.length > 0;
    const hasMore = displayedContacts.length < contacts.length;
    elements.tableWrapper.hidden = !hasResults;
    elements.cards.hidden = !hasResults;
    elements.loadMoreArea.hidden = !hasMore;
    elements.empty.hidden = hasResults;
    elements.loading.hidden = true;
    elements.error.hidden = true;
    elements.clearSearch.hidden = state.query.length === 0;
    updateFilterPresentation();
    updateResultsMeta(contacts.length, displayedContacts.length);
    updateSortIndicators();
}

function resetVisibleLimit() {
    state.visibleLimit = CONTACTS_PER_PAGE;
}

function setLoading() {
    elements.loading.hidden = false;
    elements.error.hidden = true;
    elements.empty.hidden = true;
    elements.tableWrapper.hidden = true;
    elements.cards.hidden = true;
    elements.loadMoreArea.hidden = true;
    elements.count.textContent = "Carregando...";
    elements.countDescription.textContent = "Aguarde um instante";
}

function setError() {
    elements.loading.hidden = true;
    elements.error.hidden = false;
    elements.empty.hidden = true;
    elements.tableWrapper.hidden = true;
    elements.cards.hidden = true;
    elements.loadMoreArea.hidden = true;
    elements.count.textContent = "Agenda indisponível";
    elements.countDescription.textContent = "Não foi possível consultar";
}

async function refreshCsrfToken() {
    const response = await fetch(CSRF_URL, {
        headers: { Accept: "application/json" },
        credentials: "same-origin"
    });
    if (!response.ok) {
        throw new Error("Não foi possível preparar uma operação segura.");
    }
    const csrf = await response.json();
    state.csrfToken = csrf.token;
    state.csrfHeader = csrf.headerName;
}

async function restoreAdminSession() {
    try {
        await refreshCsrfToken();
        const response = await fetch(SESSION_URL, {
            headers: { Accept: "application/json" },
            credentials: "same-origin"
        });
        const data = response.ok ? await response.json() : { admin: 0 };
        state.isAdmin = data.admin === 1;
    } catch (error) {
        state.isAdmin = false;
        console.error(error);
    }
    applyAdminState();
}

function secureHeaders(includeContentType = false) {
    const headers = { [state.csrfHeader]: state.csrfToken };
    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

async function loadContacts() {
    setLoading();
    try {
        const response = await fetch(API_URL, { headers: { Accept: "application/json" } });
        if (!response.ok) {
            throw new Error(`Falha ao carregar contatos: ${response.status}`);
        }
        const data = await response.json();
        state.contatos = Array.isArray(data) ? data : [];
        updateFilterOptions();
        renderContacts();
    } catch (error) {
        console.error(error);
        setError();
    }
}

function clearSearch({ focus = true } = {}) {
    state.query = "";
    elements.search.value = "";
    resetVisibleLimit();
    renderContacts();
    if (focus) {
        elements.search.focus();
    }
}

function clearFilters() {
    state.managementFilter = "";
    state.departmentFilter = "";
    resetVisibleLimit();
    updateFilterOptions();
    renderContacts();
    elements.managementFilter.focus();
}

function clearSingleFilter(filterName) {
    if (filterName === "management") {
        state.managementFilter = "";
        state.departmentFilter = "";
    } else if (filterName === "department") {
        state.departmentFilter = "";
    }
    resetVisibleLimit();
    updateFilterOptions();
    renderContacts();
}

function formatPhone(contact) {
    return `(21) ${PHONE_PREFIX}-${contact.ramal || ""}`;
}

async function copyPhone(contact) {
    if (!contact) {
        return;
    }
    const phone = formatPhone(contact);
    try {
        await navigator.clipboard.writeText(phone);
        showToast("Telefone copiado", `${phone} está na área de transferência.`);
    } catch (error) {
        const temporary = document.createElement("textarea");
        temporary.value = phone;
        temporary.setAttribute("readonly", "");
        temporary.className = "sr-only";
        document.body.append(temporary);
        temporary.select();
        const copied = document.execCommand("copy");
        temporary.remove();
        if (copied) {
            showToast("Telefone copiado", `${phone} está na área de transferência.`);
        } else {
            showToast("Não foi possível copiar", `Anote o número ${phone}.`, "error");
        }
    }
}

function applyAdminState() {
    elements.adminLogin.hidden = state.isAdmin;
    elements.addContact.hidden = !state.isAdmin;
    elements.logout.hidden = !state.isAdmin;
    elements.adminToolbar.hidden = !state.isAdmin;
    document.querySelectorAll(".admin-only").forEach((element) => {
        element.hidden = !state.isAdmin;
    });
}

function contactFormSnapshot() {
    return JSON.stringify({
        gerencia: document.querySelector("#gerencia").value.trim(),
        setor: document.querySelector("#setor").value.trim(),
        usuario: document.querySelector("#usuario").value.trim(),
        ramal: document.querySelector("#ramal").value.trim()
    });
}

function updateContactFormState() {
    const ramal = document.querySelector("#ramal").value;
    const dirty = contactFormSnapshot() !== state.initialContactForm;
    const valid = elements.contactForm.checkValidity() && /^\d{4}$/.test(ramal);
    elements.extensionCounter.textContent = String(ramal.length);
    elements.unsavedIndicator.hidden = !dirty;
    elements.saveContact.disabled = !dirty || !valid;
}

function getFocusableElements(modal) {
    return [...modal.querySelectorAll(
        "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"
    )].filter((element) => !element.hidden);
}

function openModal(modal, initialFocus, returnFocus = document.activeElement) {
    state.lastFocusedElement = returnFocus;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => (initialFocus || getFocusableElements(modal)[0])?.focus());
}

function closeModal(modal) {
    modal.hidden = true;
    if (![elements.loginModal, elements.contactModal, elements.confirmModal].some((item) => !item.hidden)) {
        document.body.classList.remove("modal-open");
    }
    state.lastFocusedElement?.focus();
}

function trapModalFocus(event, modal) {
    if (event.key !== "Tab") {
        return;
    }
    const focusable = getFocusableElements(modal);
    if (!focusable.length) {
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function showToast(title, message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const copy = document.createElement("div");
    const heading = document.createElement("strong");
    const description = document.createElement("span");
    heading.textContent = title;
    description.textContent = message;
    copy.append(heading, description);
    toast.append(copy);
    elements.toastRegion.append(toast);

    window.setTimeout(() => toast.remove(), 4300);
}

function findContact(id) {
    return state.contatos.find((contact) => String(contact.id) === String(id));
}

function openNewContact() {
    elements.contactForm.reset();
    document.querySelector("#contatoId").value = "";
    elements.modalTitle.textContent = "Adicionar contato";
    elements.saveContact.textContent = "Salvar contato";
    elements.contactError.hidden = true;
    state.initialContactForm = contactFormSnapshot();
    updateContactFormState();
    openModal(elements.contactModal, document.querySelector("#gerencia"));
}

function openEditContact(contact) {
    if (!contact) {
        return;
    }
    document.querySelector("#contatoId").value = contact.id;
    document.querySelector("#gerencia").value = contact.gerencia || "";
    document.querySelector("#setor").value = contact.setor || "";
    document.querySelector("#usuario").value = contact.usuario || "";
    document.querySelector("#ramal").value = contact.ramal || "";
    elements.modalTitle.textContent = "Editar contato";
    elements.saveContact.textContent = "Salvar alterações";
    elements.contactError.hidden = true;
    state.initialContactForm = contactFormSnapshot();
    updateContactFormState();
    openModal(elements.contactModal, document.querySelector("#gerencia"));
}

function openDeleteConfirmation(contact) {
    if (!contact) {
        return;
    }
    state.pendingDeleteId = contact.id;
    elements.confirmText.textContent = `O contato de ${contact.usuario || "usuário sem nome"} será removido da agenda.`;
    elements.confirmName.textContent = contact.usuario || "Contato sem nome";
    elements.confirmArea.textContent = [contact.gerencia, contact.setor].filter(Boolean).join(" · ") || "Sem área informada";
    elements.confirmExtension.textContent = `Ramal ${formatPhone(contact)}`;
    openModal(elements.confirmModal, document.querySelector("#btnCancelarExclusao"));
}

async function handleLogin(event) {
    event.preventDefault();
    elements.loginError.hidden = true;
    const submit = elements.loginForm.querySelector("[type='submit']");
    submit.disabled = true;
    submit.textContent = "Entrando...";

    try {
        await refreshCsrfToken();
        const response = await fetch(LOGIN_URL, {
            method: "POST",
            headers: secureHeaders(true),
            credentials: "same-origin",
            body: JSON.stringify({
                login: document.querySelector("#username").value.trim(),
                senha: document.querySelector("#password").value
            })
        });
        const data = await response.json();
        if (!response.ok || data.admin !== 1) {
            throw new Error(data.erro || "Acesso não autorizado.");
        }

        state.isAdmin = true;
        await refreshCsrfToken();
        applyAdminState();
        closeModal(elements.loginModal);
        renderContacts();
        showToast("Acesso liberado", "Modo administrador ativado.");
    } catch (error) {
        elements.loginError.textContent = error.message;
        elements.loginError.hidden = false;
    } finally {
        submit.disabled = false;
        submit.textContent = "Entrar";
    }
}

async function handleContactSubmit(event) {
    event.preventDefault();
    elements.contactError.hidden = true;
    const id = document.querySelector("#contatoId").value;
    const data = {
        gerencia: document.querySelector("#gerencia").value.trim(),
        setor: document.querySelector("#setor").value.trim(),
        usuario: document.querySelector("#usuario").value.trim(),
        ramal: document.querySelector("#ramal").value.trim()
    };

    const duplicated = state.contatos.some((contact) => {
        const currentId = String(id || "");
        return String(contact.id) !== currentId
            && (normalize(contact.usuario) === normalize(data.usuario)
                || String(contact.ramal) === data.ramal);
    });
    if (duplicated) {
        elements.contactError.textContent = "Já existe um contato com este usuário ou ramal. Revise os dados antes de salvar.";
        elements.contactError.hidden = false;
        return;
    }

    if (!/^\d{4}$/.test(data.ramal)) {
        elements.contactError.textContent = "Informe o ramal com quatro dígitos.";
        elements.contactError.hidden = false;
        document.querySelector("#ramal").focus();
        return;
    }

    elements.saveContact.disabled = true;
    elements.saveContact.textContent = "Salvando...";

    try {
        const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
            method: id ? "PUT" : "POST",
            headers: secureHeaders(true),
            credentials: "same-origin",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Não foi possível salvar o contato.");
        }
        closeModal(elements.contactModal);
        await loadContacts();
        showToast("Contato salvo", "A agenda foi atualizada com sucesso.");
    } catch (error) {
        elements.contactError.textContent = error.message;
        elements.contactError.hidden = false;
    } finally {
        elements.saveContact.disabled = false;
        elements.saveContact.textContent = id ? "Salvar alterações" : "Salvar contato";
    }
}

async function deleteContact() {
    if (!state.pendingDeleteId) {
        return;
    }
    elements.confirmDelete.disabled = true;
    elements.confirmDelete.textContent = "Excluindo...";

    try {
        const response = await fetch(`${API_URL}/${state.pendingDeleteId}`, {
            method: "DELETE",
            headers: secureHeaders(),
            credentials: "same-origin"
        });
        if (!response.ok) {
            throw new Error("Não foi possível excluir o contato.");
        }
        closeModal(elements.confirmModal);
        state.pendingDeleteId = null;
        await loadContacts();
        showToast("Contato excluído", "O registro foi removido da agenda.");
    } catch (error) {
        showToast("Falha na exclusão", error.message, "error");
    } finally {
        elements.confirmDelete.disabled = false;
        elements.confirmDelete.textContent = "Excluir contato";
    }
}

function handleContactAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
        return;
    }
    const contact = findContact(button.dataset.id);
    if (button.dataset.action === "menu") {
        const menu = button.parentElement.querySelector(".action-menu");
        const willOpen = menu.hidden;
        document.querySelectorAll(".action-menu:not([hidden])").forEach((openMenu) => {
            openMenu.hidden = true;
            openMenu.parentElement.querySelector("[aria-expanded]")?.setAttribute("aria-expanded", "false");
        });
        menu.hidden = !willOpen;
        button.setAttribute("aria-expanded", String(willOpen));
    } else if (button.dataset.action === "edit") {
        openEditContact(contact);
    } else if (button.dataset.action === "delete") {
        openDeleteConfirmation(contact);
    } else if (button.dataset.action === "copy") {
        copyPhone(contact);
    }
}

elements.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    resetVisibleLimit();
    renderContacts();
});
elements.clearSearch.addEventListener("click", () => clearSearch());
elements.clearEmpty.addEventListener("click", () => clearSearch());
elements.clearFilters.addEventListener("click", clearFilters);
elements.toggleFilters.addEventListener("click", () => {
    const willOpen = elements.filterPanel.hidden;
    elements.filterPanel.hidden = !willOpen;
    elements.toggleFilters.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
        elements.managementFilter.focus();
    }
});
elements.activeFilterList.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-clear-filter]");
    if (chip) {
        clearSingleFilter(chip.dataset.clearFilter);
    }
});
elements.managementFilter.addEventListener("change", (event) => {
    state.managementFilter = event.target.value;
    state.departmentFilter = "";
    resetVisibleLimit();
    updateFilterOptions();
    renderContacts();
});
elements.departmentFilter.addEventListener("change", (event) => {
    state.departmentFilter = event.target.value;
    resetVisibleLimit();
    renderContacts();
});
elements.retry.addEventListener("click", loadContacts);
elements.loadMore.addEventListener("click", () => {
    state.visibleLimit += CONTACTS_PER_PAGE;
    renderContacts();
});
elements.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
window.addEventListener("scroll", () => {
    elements.backToTop.hidden = window.scrollY < 520;
}, { passive: true });

document.querySelectorAll(".sort-button").forEach((button) => {
    button.addEventListener("click", () => {
        const key = button.dataset.sort;
        if (state.sortKey === key) {
            state.sortDirection = state.sortDirection === "ascending" ? "descending" : "ascending";
        } else {
            state.sortKey = key;
            state.sortDirection = "ascending";
        }
        resetVisibleLimit();
        renderContacts();
    });
});

elements.tableBody.addEventListener("click", handleContactAction);
elements.cards.addEventListener("click", handleContactAction);
elements.adminLogin.addEventListener("click", () => {
    elements.loginForm.reset();
    elements.loginError.hidden = true;
    openModal(
        elements.loginModal,
        document.querySelector("#username"),
        elements.adminLogin
    );
});
elements.addContact.addEventListener("click", openNewContact);
elements.logout.addEventListener("click", async () => {
    try {
        await fetch(LOGOUT_URL, {
            method: "POST",
            headers: secureHeaders(),
            credentials: "same-origin"
        });
    } finally {
        state.isAdmin = false;
        state.csrfToken = null;
        await refreshCsrfToken().catch(() => {});
        applyAdminState();
        renderContacts();
        showToast("Sessão encerrada", "Você saiu do modo administrador.");
    }
});

document.querySelector("#btnFecharLogin").addEventListener("click", () => closeModal(elements.loginModal));
document.querySelector("#btnFecharContato").addEventListener("click", () => closeModal(elements.contactModal));
document.querySelector("#btnCancelarContato").addEventListener("click", () => closeModal(elements.contactModal));
document.querySelector("#btnCancelarExclusao").addEventListener("click", () => {
    state.pendingDeleteId = null;
    closeModal(elements.confirmModal);
});
elements.confirmDelete.addEventListener("click", deleteContact);
elements.loginForm.addEventListener("submit", handleLogin);
elements.contactForm.addEventListener("submit", handleContactSubmit);
elements.contactForm.addEventListener("input", (event) => {
    if (event.target.id === "ramal") {
        event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
    }
    updateContactFormState();
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".action-menu-wrap")) {
        document.querySelectorAll(".action-menu:not([hidden])").forEach((menu) => {
            menu.hidden = true;
            menu.parentElement.querySelector("[aria-expanded]")?.setAttribute("aria-expanded", "false");
        });
    }
});

[elements.loginModal, elements.contactModal, elements.confirmModal].forEach((modal) => {
    modal.addEventListener("mousedown", (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
    modal.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal(modal);
        } else {
            trapModalFocus(event, modal);
        }
    });
});

Promise.all([restoreAdminSession(), loadContacts()]);
