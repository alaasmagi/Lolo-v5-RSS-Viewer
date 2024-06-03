const defaultFeed = "https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss";
const feedKey = 'rssFeeds';
let feeds = JSON.parse(localStorage.getItem(feedKey)) || [defaultFeed];
let articles = [];
let feedBorderColors = {};

document.addEventListener("DOMContentLoaded", () => {
    loadFeeds();
    displayFeedList();
});

async function loadFeeds() {
    articles = [];
    for (const feed of feeds) {
        await fetchArticles(feed);
    }
    displayArticles();
}

async function fetchArticles(feedUrl) {
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
        const data = await response.json();
        if (data.items) {
            articles = articles.concat(data.items.map(item => ({
                ...item,
                feedUrl,
                articleUrl: item.link || item.guid || '',
                imageUrl: extractImageUrl(item) || 'placeholder.jpg',
                plainDescription: stripHtml(item.description || ''),
				pubDate: new Date(item.pubDate).toLocaleDateString(),
				author: item.author || item['dc:creator'] || 'Unknown',
				categories: item.categories || []
            })));
        }
    } catch (error) {
        console.error("Failed to fetch articles", error);
    }
}

function extractImageUrl(item) {
    if (item.enclosure && item.enclosure.link) {
        return item.enclosure.link;
    }
    if (item.thumbnail) {
        return item.thumbnail;
    }
    const doc = new DOMParser().parseFromString(item.description, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
}

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

async function fetchCleanedArticle(articleUrl) {
    const response = await fetch('https://uptime-mercury-api.azurewebsites.net/webparser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: articleUrl })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch cleaned article');
    }

    const data = await response.json();
    return data.cleanedArticleContent;
}

/*
function openModal(content) {
    const modal = document.getElementById('article-modal');
    const modalContent = document.getElementById('modal-article-content');
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('article-modal');
    modal.style.display = 'none';
}
*/

document.querySelector('.close-button').addEventListener('click', closeModal);

function displayArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    const filteredArticles = filterArticlesByCategory();
    filteredArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    filteredArticles.forEach(article => {
        const feedUrl = article.feedUrl;
        if (!(feedUrl in feedBorderColors)) {
            feedBorderColors[feedUrl] = getRandomColor();
        }

        const articleElement = document.createElement('article');
        articleElement.classList.add('article');
        articleElement.style.border = `5px solid ${feedBorderColors[feedUrl]}`;

        const articleLink = document.createElement('a');
        articleLink.href = article.articleUrl;
        articleLink.target = "_blank";

        const articleImage = document.createElement('img');
        articleImage.src = article.imageUrl;
        articleImage.alt = article.title;

        const articleTitle = document.createElement('h3');
        articleTitle.textContent = article.title;

        const articleDescription = document.createElement('p');
        articleDescription.textContent = article.plainDescription;
        
        const articlePubDate = document.createElement('p');
        articlePubDate.textContent = `Date of publication: ${article.pubDate}`;
        
        const articleAuthor = document.createElement('p');
        articleAuthor.textContent = `Author: ${article.author}`;
        
        const articleCategories = document.createElement('p');
        articleCategories.textContent = `${article.categories.join(', ')}`
        
        articleLink.appendChild(articleImage);
        articleLink.appendChild(articleTitle);
        articleLink.appendChild(articleDescription);
        articleLink.appendChild(articleAuthor);
        articleLink.appendChild(articlePubDate);
        articleLink.appendChild(articleCategories);
        articleElement.appendChild(articleLink);
        
        container.appendChild(articleElement);
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

async function addFeed() {
    const newFeedUrl = document.getElementById('new-feed-url').value;
    document.getElementById('new-feed-url').value = "";
    if (newFeedUrl && !feeds.includes(newFeedUrl)) {
        feeds.push(newFeedUrl);
        localStorage.setItem(feedKey, JSON.stringify(feeds));
        await fetchArticles(newFeedUrl); // Fetch articles for the new feed
        displayArticles(); // Display all articles
        displayFeedList(); // Update the feed list
    }
}

function displayFeedList() {
    const feedList = document.getElementById('feed-list');
    feedList.innerHTML = '';
    feeds.forEach((feed, index) => {
        const feedItem = document.createElement('li');
        feedItem.innerHTML = `
            <span>${feed}</span>
            ${feed !== defaultFeed ? `<button onclick="editFeed(${index})">Edit feed</button>` : ''}
            ${feed !== defaultFeed ? `<button onclick="removeFeed(${index})">Remove feed</button>` : ''}
        `;
        feedList.appendChild(feedItem);
    });
}

function editFeed(index) {
    const newFeedUrl = prompt("Enter new RSS feed URL:", feeds[index]);
    if (newFeedUrl && newFeedUrl !== feeds[index]) {
        feeds[index] = newFeedUrl;
        localStorage.setItem(feedKey, JSON.stringify(feeds));
        loadFeeds().then(() => {
            displayArticles();
            displayFeedList();
        });
    }
}

function removeFeed(index) {
    if (confirm("Are you sure you want to remove this feed?")) {
        feeds.splice(index, 1);
        localStorage.setItem(feedKey, JSON.stringify(feeds));
        loadFeeds().then(() => {
            displayArticles();
            displayFeedList();
        });
    }
}

function filterArticles() {
    displayArticles();
}

function filterArticlesByCategory() {
    const filterText = document.getElementById('category-filter').value.toLowerCase();
    if (!filterText) return articles;
    return articles.filter(article =>
        article.categories.some(category => category.toLowerCase().includes(filterText))
    );
}

/*
async function openArticle(url) {
    try {
        const response = await fetch('https://uptime-mercury-api.azurewebsites.net/webparser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await response.json();
        document.getElementById('article-content').innerHTML = data.content;
        document.getElementById('article-modal').style.display = 'flex';
    } catch (error) {
        console.error("Failed to fetch article content", error);
    }
}
*/

function closeModal() {
    document.getElementById('article-modal').style.display = 'none';
}
