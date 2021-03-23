from flask import Flask, render_template, redirect, url_for
from flask_pymongo import PyMongo
import scrape_mars

app = Flask(__name__)

# Configure MongoDB connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/mars_db"
mongo = PyMongo(app)

@app.route("/")
def index():
    mars_data = mongo.db.mars.find_one()
    return render_template("index.html", mars_data=mars_data)


@app.route("/scrape")
def scrape():
    mars_db = mongo.db.mars
    mars_data = scrape_mars.scrape_all()
    mars_db.update({}, mars_data, upsert=True)
    return "scrape successful"


if __name__ == "__main__":
    app.run()
