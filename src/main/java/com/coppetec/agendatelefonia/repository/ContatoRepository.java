package com.coppetec.agendatelefonia.repository;

import com.coppetec.agendatelefonia.model.Contato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContatoRepository extends JpaRepository<Contato, Long> {
}
