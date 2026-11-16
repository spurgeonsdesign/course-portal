# Spurgeons Courses – sign-in showcase

A clickable prototype of the redesigned Spurgeons Courses sign-in page and the course dashboard that follows it.

- `index.html` – sign-in page. Submitting the form goes straight to the dashboard (no real email is sent).
- `dashboard.html` – course dashboard, built from the "Sign On Screen" Figma file.

Plain HTML, CSS and JavaScript – no build step. Open `index.html` in a browser, or serve it with GitHub Pages.

## Structure

```
index.html
dashboard.html
css/login.css
css/dashboard.css
js/dashboard.js      course data, programme carousel, accordions, search, Expand All, Manage Account menu
images/              logo and illustrations
```

## Editing content

- Programmes, courses and modules: the `PROGRAMMES`, `COURSE_ART` and `MODULES` lists at the top of `js/dashboard.js`. Each programme has a banner picture (`art`) and colour (`theme`: `purple` or `navy`); each course has a picture in `COURSE_ART`.
- Name and stats: in `dashboard.html` (`[Full Name]` and the three stat boxes).
- Placeholder links (`#help`, `#privacy`, `#terms`, `#contact`, Manage Account items, etc.) still need real URLs.
- After changing CSS or JS, bump the `?v=` number on its link so browsers load the new file.

## Images

- `spurgeons-logo.svg` – from the Spurgeons Support Platform image library.
- `hero-main.svg`, `prog-*.svg`, `course-*.svg`, `contact.svg` – illustrations, cropped to their drawings.
