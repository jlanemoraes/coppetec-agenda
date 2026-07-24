package com.coppetec.agendatelefonia;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "ADMIN_PASSWORD=test-password",
        "spring.datasource.url=jdbc:sqlite:target/security-test.db",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false"
})
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicContactListIsAccessibleAndProtectedBySecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/contatos"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().exists("Content-Security-Policy"));
    }

    @Test
    void anonymousWriteIsRejected() throws Exception {
        mockMvc.perform(post("/api/contatos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validContact()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidPasswordIsRejected() throws Exception {
        mockMvc.perform(post("/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"admin\",\"senha\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("Falha na autenticação"));
    }

    @Test
    void authenticatedAdminCanWriteButInvalidContactIsRejected() throws Exception {
        MvcResult login = mockMvc.perform(post("/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"admin\",\"senha\":\"test-password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admin").value(1))
                .andReturn();

        HttpSession session = login.getRequest().getSession(false);
        mockMvc.perform(post("/api/contatos")
                        .session((org.springframework.mock.web.MockHttpSession) session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"gerencia\":\"\",\"setor\":\"TI\",\"usuario\":\"Teste\",\"ramal\":\"12\"}"))
                .andExpect(status().isBadRequest());
    }

    private String validContact() {
        return "{\"gerencia\":\"Administracao\",\"setor\":\"TI\",\"usuario\":\"Teste\",\"ramal\":\"3999\"}";
    }
}
