# baby-name-scraper
Scrapes U.S. baby names from the Social Security Administration.
Uses Node.js.

## Running
```
npm install
npm start
```

Good stuff is in `./csv`.

## Why?
I had a baby! Yay. I have paternity leave! Also yay.

I wanted to play with baby name data, and found Hadley Wickham's [data-baby-names](https://github.com/hadley/data-baby-names) scraper/parser. But, it didn't work! I eventually figured out that it's because SSA went SSL (good on them), so all that was needed to get the R scraper to work was `http` -> `https`.

But by then, I'd already decided it would be nice to have a version of this that was easier to run than "install R, install R libs, make sure Ruby install is up to date, wade into this and that". Something more like `npm start`. And here we are.
