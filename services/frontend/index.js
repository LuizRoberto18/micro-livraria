// ── Utilitários ────────────────────────────────────────────────────────────────

function starsHTML(rating) {
    let html = '<span class="stars-display">';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star ${i <= rating ? 'star-filled' : 'star-empty'}">${i <= rating ? '★' : '☆'}</span>`;
    }
    html += '</span>';
    return html;
}

function ratingLabel(rating) {
    const labels = { 1: 'Ruim', 2: 'Regular', 3: 'Ok', 4: 'Bom', 5: 'Excelente' };
    return labels[rating] || '';
}

function averageRating(reviews) {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

function avatarColor(name) {
    const colors = ['#3273dc', '#23d160', '#ff3860', '#ffdd57', '#209cee', '#ff6b6b'];
    let hash = 0;
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// ── Construção do card do livro ────────────────────────────────────────────────

function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6">Disponível em estoque: 5</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button button-reviews is-warning is-light is-fullwidth" data-id="${book.id}" data-name="${book.name}">
                        ⭐ Ver Avaliações
                    </button>
                    <button class="button button-buy is-success is-fullwidth" style="margin-top: 0.5rem">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

// ── Modal de avaliações ────────────────────────────────────────────────────────

function openReviewsModal() {
    document.getElementById('reviews-modal').classList.add('is-active');
    document.documentElement.classList.add('is-clipped');
}

function closeReviewsModal() {
    document.getElementById('reviews-modal').classList.remove('is-active');
    document.documentElement.classList.remove('is-clipped');
}

function renderLoading() {
    document.getElementById('reviews-modal-body').innerHTML = `
        <div class="reviews-loading">
            <div class="reviews-spinner"></div>
            <p>Carregando avaliações...</p>
        </div>`;
}

function renderEmpty() {
    document.getElementById('reviews-modal-body').innerHTML = `
        <div class="reviews-empty">
            <span class="reviews-empty-icon">📭</span>
            <p class="reviews-empty-title">Nenhuma avaliação ainda</p>
            <p class="reviews-empty-sub">Seja o primeiro a avaliar este livro!</p>
        </div>`;
}

function renderError() {
    document.getElementById('reviews-modal-body').innerHTML = `
        <div class="reviews-empty">
            <span class="reviews-empty-icon">⚠️</span>
            <p class="reviews-empty-title">Erro ao carregar</p>
            <p class="reviews-empty-sub">Não foi possível buscar as avaliações.</p>
        </div>`;
}

function renderReviews(reviews, bookName) {
    const avg = averageRating(reviews);
    const total = reviews.length;

    const summaryHTML = `
        <div class="reviews-summary">
            <div class="reviews-avg-score">${avg.toFixed(1)}</div>
            <div class="reviews-avg-info">
                <div class="reviews-avg-stars">${starsHTML(Math.round(avg))}</div>
                <div class="reviews-avg-count">${total} avaliação${total !== 1 ? 'ões' : ''}</div>
            </div>
        </div>
        <hr class="reviews-divider">`;

    const cardsHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-card-left">
                <div class="review-avatar" style="background: ${avatarColor(r.author)}">
                    ${r.author.charAt(0).toUpperCase()}
                </div>
            </div>
            <div class="review-card-right">
                <div class="review-card-header">
                    <span class="review-author">${r.author}</span>
                    <span class="review-rating-badge">
                        ${starsHTML(r.rating)}
                        <span class="review-label">${ratingLabel(r.rating)}</span>
                    </span>
                </div>
                <p class="review-comment">"${r.comment}"</p>
            </div>
        </div>`).join('');

    document.getElementById('reviews-modal-body').innerHTML = summaryHTML + cardsHTML;
}

function showReviews(bookId, bookName) {
    document.getElementById('reviews-modal-title').textContent = bookName;
    document.getElementById('reviews-modal-subtitle').textContent = 'Opiniões de quem já leu';

    renderLoading();
    openReviewsModal();

    fetch(`http://localhost:3000/reviews/${bookId}`)
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(reviews => {
            if (!reviews || reviews.length === 0) {
                renderEmpty();
            } else {
                renderReviews(reviews, bookName);
            }
        })
        .catch(() => renderError());
}

// ── Frete ──────────────────────────────────────────────────────────────────────

function calculateShipping(id, cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) return data.json();
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

// ── Inicialização ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');

    // Fechar modal ao clicar no X, no botão Fechar ou no fundo escuro
    document.getElementById('reviews-modal-close').addEventListener('click', closeReviewsModal);
    document.getElementById('reviews-modal-close-btn').addEventListener('click', closeReviewsModal);
    document.getElementById('reviews-modal-bg').addEventListener('click', closeReviewsModal);

    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) return data.json();
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(id, cep);
                    });
                });

                document.querySelectorAll('.button-reviews').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        const name = e.currentTarget.getAttribute('data-name');
                        showReviews(id, name);
                    });
                });

                document.querySelectorAll('.button-buy').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});