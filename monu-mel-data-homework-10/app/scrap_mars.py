# Imports
from splinter import Browser
from bs4 import BeautifulSoup as soup
import pandas as pd
import datetime as dt


def scrape_all():
    # Setup driver
    executable_path = {'executable_path': 'chromedriver'}
    browser = Browser('chrome', **executable_path, headless=True)

    news_title, news_paragraph = mars_news(browser)

    # Gather data with functions
    data = {
        "news_title": news_title,
        "news_paragraph": news_paragraph,
        "hemispheres": hemispheres(browser),
        "featured_image": featured_image(browser),
        "facts": mars_facts(),
        "last_modified": dt.datetime.now()
    }

    # Exit driver
    browser.quit()

    return data


def mars_news(browser):

    # Go to site
    url = 'https://mars.nasa.gov/news/'
    browser.visit(url)

    browser.is_element_present_by_css("ul.item_list li.slide")

    # Parse html
    html = browser.html
    news_soup = soup(html, 'html.parser')

    # Error handling
    try:
        slide_element = news_soup.select_one("ul.item_list li.slide")
        # Find 'a' tag from slide_element
        news_title = slide_element.find("div", class_="content_title").get_text()
        # Find the paragraph text
        news_p = slide_element.find("div", class_="article_teaser_body").get_text()

    except AttributeError:
        return None, None

    return news_title, news_p


def featured_image(browser):
    # Go to URL
    url = 'https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars'
    browser.visit(url)

    # Find and click button for full image
    image_element = browser.find_by_id('full_image')[0]
    image_element.click()

    # Find and click 'more info' button
    browser.is_element_present_by_text('more info', wait_time=1)
    more_info_element = browser.links.find_by_partial_text('more info')
    more_info_element.click()

    # Parse html
    html = browser.html
    image_soup = soup(html, 'html.parser')

    # Error handling
    try:
        # Find image url
        img_url_rel = image_soup.select_one('figure.lede a img').get("src")

    except AttributeError:
        return None

    # Image URL
    img_url = f'https://www.jpl.nasa.gov{img_url_rel}'

    return img_url

def mars_facts():
    # Error handling
    try:
        # Scrape the facts table into df
        df = pd.read_html('http://space-facts.com/mars/')[0]

    except BaseException:
        return None

    # Setup df
    df.columns = ['Description', 'Mars']
    df.set_index('Description', inplace=True)

    # Convert dataframe to html
    return df.to_html(classes="table table-striped")


def hemispheres(browser):
    url = "https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars"

    browser.visit(url)

    # List for hemisphere images
    hemisphere_image_urls = list()
    for i in range(4):
        # Click link and find the sample anchor
        browser.find_by_css("a.product-item h3")[i].click()
        hemisphere_data = scrape_hemisphere(browser.html)
        # Append url to url list of list of hemisphere images
        hemisphere_image_urls.append(hemisphere_data)
        # Navigate back
        browser.back()

    # Return href
    return hemisphere_image_urls


def scrape_hemisphere(html):
    # Parse html
    hemisphere_soup = soup(html, "html.parser")

    # Error handling
    try:
        title_element = hemisphere_soup.find("h2", class_="title").get_text()
        sample_element = hemisphere_soup.find("a", text="Sample").get("href")

    except AttributeError:
        title_element = None
        sample_element = None

    hemispheres = {
        "title": title_element,
        "img_url": sample_element
    }

    return hemispheres


if __name__ == "__main__":
    print(scrape_all())
