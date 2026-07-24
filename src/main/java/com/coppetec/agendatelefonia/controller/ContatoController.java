package com.coppetec.agendatelefonia.controller;

import com.coppetec.agendatelefonia.model.Contato;
import com.coppetec.agendatelefonia.repository.ContatoRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contatos")
public class ContatoController {

    private final ContatoRepository contatoRepository;

    public ContatoController(ContatoRepository contatoRepository) {
        this.contatoRepository = contatoRepository;
    }

    @GetMapping
    public List<Contato> listarTodos() {
        return contatoRepository.findAll();
    }

    @PostMapping
    public Contato criar(@Valid @RequestBody Contato contato) {
        return contatoRepository.save(contato);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contato> atualizar(@PathVariable Long id, @Valid @RequestBody Contato dadosNovos) {
        return contatoRepository.findById(id).map(contato -> {
            contato.setGerencia(dadosNovos.getGerencia());
            contato.setSetor(dadosNovos.getSetor());
            contato.setUsuario(dadosNovos.getUsuario());
            contato.setRamal(dadosNovos.getRamal());
            return ResponseEntity.ok(contatoRepository.save(contato));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (contatoRepository.existsById(id)) {
            contatoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
