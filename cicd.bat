#heroku login
git add .
git commit -m "New commit %date% %time%"
git push heroku master
heroku scale worker=1 web=0
heroku logs
