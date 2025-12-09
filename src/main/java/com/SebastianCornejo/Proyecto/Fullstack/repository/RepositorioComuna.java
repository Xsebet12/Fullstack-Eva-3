package com.SebastianCornejo.Proyecto.Fullstack.repository;

import com.SebastianCornejo.Proyecto.Fullstack.entity.Comuna;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
@Repository
public interface RepositorioComuna extends JpaRepository<Comuna, Integer> {
    Optional<Comuna> findByNomComunaIgnoreCase(String nomComuna);
    @EntityGraph(attributePaths = {"region"})
    List<Comuna> findAll();
}
