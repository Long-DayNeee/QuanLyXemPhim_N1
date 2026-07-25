package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Entity.Movie;
import com.duanweb.duanweb.Service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/movie")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping("/list")
    public String list(Model model){
        model.addAttribute("movies",movieService.getAll());
        model.addAttribute("movie",new Movie());
        return "movie/list";
    }

    @PostMapping("/save")
    public String save(Movie movie){
        movieService.save(movie);
        return "redirect:/movie/list";
    }

    @GetMapping("/delete/{id}")
    public String delete(@PathVariable Integer id){
        movieService.delete(id);
        return "redirect:/movie/list";
    }

    @GetMapping("/edit/{id}")
    public String edit(@PathVariable Integer id,Model model){
        model.addAttribute("movie",movieService.getById(id));
        model.addAttribute("movies",movieService.getAll());
        return "movie/list";
    }
}