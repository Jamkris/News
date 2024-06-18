const API_KEY = '89f6c4d8066a407a8f79c73c8df5de69';

let currentPage = 1;
let currentCategory = null;
let currentKeyword = null;
let isLoading = false;
let lastArticleCount = 0;

function fetchNews(isSearching) {
	if (isLoading) return;

	isLoading = true;
	let url;
	if (isSearching) {
		const keyword = document.getElementById('searchKeyword').value;
		url = `https://newsapi.org/v2/everything?q=${keyword}&apiKey=${API_KEY}&page=${currentPage}`;
	} else {
		const category =
			currentCategory || document.getElementById('category').value;
		url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}&page=${currentPage}`;
	}

	fetch(url)
		.then(response => response.json())
		.then(data => {
			const newsContainer = document.getElementById('newsContainer');
			if (currentPage === 1) {
				newsContainer.innerHTML = '';
			}

			const articlesWithImage = data.articles.filter(
				article => article.urlToImage
			);

			if (
				articlesWithImage.length === 0 ||
				articlesWithImage.length === lastArticleCount
			) {
				displayNoMoreNews();
				return;
			}

			lastArticleCount = articlesWithImage.length;

			articlesWithImage.forEach(article => {
				const newsItem = document.createElement('div');
				newsItem.className = 'newsItem';
				newsItem.innerHTML = `
                    <div class="newsImage">
                        <img src="${article.urlToImage}" alt="${article.title}">
                    </div>
                    <div class="newsContent">
                        <div class="info">
                            <h5>${article.source.name}</h5>
                            <span>|</span>
                            <h5>${article.publishedAt}</h5>
                        </div>
                        <h2>${article.title}</h2>
                        <p>${article.description}</p>
                        <a href="${article.url}" target="_blank">Read More</a>
                    </div>
                `;

				const wishlistButton = document.createElement('button');
				wishlistButton.textContent = '찜하기';
				wishlistButton.onclick = () => addToWishlist(article);

				newsItem.querySelector('.newsContent').appendChild(wishlistButton);
				newsContainer.appendChild(newsItem);
			});

			currentPage++;
			isLoading = false;
		})
		.catch(error => {
			console.error('There was an error fetching the news:', error);
			isLoading = false;
		});
}

function displayNoMoreNews() {
	const newsContainer = document.getElementById('newsContainer');
	newsContainer.innerHTML += '<p>No more news to load.</p>';
}

function addToWishlist(article) {
	let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
	const articleExists = wishlist.some(item => item.url === article.url);

	if (articleExists) {
		alert('이미 찜한 뉴스입니다.');
		return;
	}

	wishlist.push(article);
	localStorage.setItem('wishlist', JSON.stringify(wishlist));
	alert('뉴스가 찜목록에 추가되었습니다.');
}

function removeFromWishlist(articleUrl) {
	let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
	wishlist = wishlist.filter(article => article.url !== articleUrl);
	localStorage.setItem('wishlist', JSON.stringify(wishlist));
	loadWishlist();
	alert('뉴스가 찜목록에서 제거되었습니다.');
}

window.onscroll = function() {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
		if (currentKeyword) {
			fetchNews(true);
		} else {
			fetchNews(false);
		}
	}
};

document.getElementById('searchKeyword').addEventListener('input', function() {
	currentPage = 1;
	currentCategory = null;
	currentKeyword = this.value;
});

document.getElementById('fetchCategory').addEventListener('click', function() {
	currentPage = 1;
	currentKeyword = null;
	fetchNews(false);
});
