package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Entity.Movie;

import java.util.List;

public interface MovieService {
    List<Movie> getAll();
    Movie getById(Integer id);
    void save(Movie movie);
    void delete(Integer id);
}
