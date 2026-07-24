package com.coppetec.agendatelefonia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "contatos")
public class Contato {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    @Size(max = 120)
    private String gerencia;

    @NotBlank
    @Size(max = 120)
    private String setor;

    @NotBlank
    @Size(max = 120)
    private String usuario;

    @NotBlank
    @Pattern(regexp = "\\d{4}")
    private String ramal;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGerencia() { return gerencia; }
    public void setGerencia(String gerencia) { this.gerencia = gerencia; }
    public String getSetor() { return setor; }
    public void setSetor(String setor) { this.setor = setor; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public String getRamal() { return ramal; }
    public void setRamal(String ramal) { this.ramal = ramal; }
}
