package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Entity.Movie;
import com.duanweb.duanweb.Repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    public MovieServiceImpl(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @Override
    public List<Movie> getAll() {
        return movieRepository.findAll();
    }

    @Override
    public Movie getById(Integer id) {
        return movieRepository.findById(id).orElse(null);
    }

    @Override
    public void save(Movie movie) {
        movieRepository.save(movie);
    }

    @Override
    public void delete(Integer id) {
        movieRepository.deleteById(id);
    }
}
