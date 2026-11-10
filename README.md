# Cohen-Web: final

Replace these files in the Cohen-Web repo:

    index.html    scan panel (already pushed) + Download button and footer link to GitHub
    *.html        footer "Download Mantis" now goes to github.com/Anurag-Chevendra/Mantis
    styles.css    scan panel styles (already pushed)
    app.js        scan panel script (already pushed)

If your repo has moved on since, the only new change is the footer link; run in the repo:

    sed -i 's#https://console.snappyfeet.org/download#https://github.com/Anurag-Chevendra/Mantis#g' *.html

Then:

    git add -A
    git commit -m "Point Mantis download links to GitHub"
    git push
