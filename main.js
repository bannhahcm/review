// =================================================================
// ============== MÔ PHỎNG DỮ LIỆU VÀ API ==========================
// =================================================================

// Trong một ứng dụng thật, dữ liệu này sẽ đến từ API server của bạn
const MOCK_DATA = [
  { searchable_type: 'PROJECT', id: 'proj1', title: 'Aqua City', description: 'Khu đô thị sinh thái thông minh tại phía Đông TP.HCM, quy mô lên đến 1.000 ha.', url: '#', image_url: 'https://via.placeholder.com/150/53b966/fff?text=Project' },
  { searchable_type: 'PRODUCT', id: 'prod1', title: 'Bán căn hộ Richstar 2PN view hồ bơi', description: 'Căn hộ 65m2, full nội thất cao cấp. Sổ hồng chính chủ, sang tên nhanh gọn.', url: '#', image_url: 'https://via.placeholder.com/150/dc3545/fff?text=Product' },
  { searchable_type: 'PRODUCT', id: 'prod2', title: 'Cho thuê nhà phố Aqua City', description: 'Nhà phố 1 trệt 2 lầu, phù hợp cho gia đình hoặc làm văn phòng.', url: '#', image_url: 'https://via.placeholder.com/150/dc3545/fff?text=Product' },
  { searchable_type: 'NEWS_ARTICLE', id: 'news1', title: 'Thị trường bất động sản cuối năm: Nhiều tín hiệu tích cực', description: 'Các chuyên gia nhận định thị trường đang dần ấm lại với nhiều chính sách hỗ trợ.', url: '#', image_url: 'https://via.placeholder.com/150/0dcaf0/fff?text=News' },
];

const MOCK_AUTOCOMPLETE = [
  { title: 'Aqua City', type: 'Dự án' },
  { title: 'Richstar', type: 'Dự án' },
  { title: 'Celadon City', type: 'Dự án' },
  { title: 'Căn hộ Quận 7', type: 'Từ khóa' },
];

// Hàm mô phỏng việc gọi API để lấy gợi ý autocomplete
function fetchAutocompleteSuggestions(query) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!query) return resolve([]);
      const lowerCaseQuery = query.toLowerCase();
      const results = MOCK_AUTOCOMPLETE.filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
      resolve(results);
    }, 150); // Giả lập độ trễ mạng
  });
}

// Hàm mô phỏng việc gọi API để lấy kết quả tìm kiếm
function fetchSearchResults(query) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!query) return resolve([]);
      const lowerCaseQuery = query.toLowerCase();
      const results = MOCK_DATA.filter(item => item.title.toLowerCase().includes(lowerCaseQuery) || item.description.toLowerCase().includes(lowerCaseQuery));
      resolve(results);
    }, 500); // Giả lập độ trễ mạng
  });
}


// =================================================================
// ============== LOGIC CHÍNH CỦA TRANG ============================
// =================================================================
document.addEventListener('DOMContentLoaded', () => {

  // --- Lấy các phần tử trên trang ---
  const headerSearchButton = document.getElementById('header-search-button');
  const searchPopup = document.getElementById('search-popup');
  const closePopupButton = document.getElementById('close-popup-button');
  const searchForm = document.getElementById('search-form');
  const popupSearchInput = document.getElementById('popup-search-input');
  const suggestionsContainer = document.getElementById('search-suggestions-container');
  const mainContent = document.getElementById('main-content');
  const resultsPage = document.getElementById('search-results-page');

  // --- LOGIC CHO POPUP TÌM KIẾM ---
  function showPopup() {
    searchPopup.style.display = 'flex';
    popupSearchInput.focus();
  }

  function hidePopup() {
    searchPopup.style.display = 'none';
  }

  headerSearchButton.addEventListener('click', showPopup);
  closePopupButton.addEventListener('click', hidePopup);
  searchPopup.addEventListener('click', (event) => {
    if (event.target === searchPopup) { // Chỉ đóng khi nhấn vào nền mờ
      hidePopup();
    }
  });

  // --- LOGIC CHO GỢI Ý TÌM KIẾM ---
  function renderSuggestions(groups) {
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'block';

    for (const group of groups) {
      if (group.items.length === 0) continue;
      
      const groupEl = document.createElement('div');
      groupEl.className = 'suggestion-group';

      const titleEl = document.createElement('div');
      titleEl.className = 'suggestion-group-title';
      titleEl.textContent = group.title;
      groupEl.appendChild(titleEl);

      const listEl = document.createElement('ul');
      listEl.className = 'suggestion-list';
      group.items.forEach(item => {
        const itemEl = document.createElement('li');
        itemEl.className = 'suggestion-item';
        itemEl.textContent = item.title;
        itemEl.addEventListener('click', () => {
          popupSearchInput.value = item.title;
          searchForm.requestSubmit(); // Tự động submit form
        });
        listEl.appendChild(itemEl);
      });
      groupEl.appendChild(listEl);
      suggestionsContainer.appendChild(groupEl);
    }
  }

  popupSearchInput.addEventListener('focus', () => {
    // Mô phỏng hiển thị lịch sử và tìm kiếm phổ biến
    const suggestionGroups = [
      { title: 'Lịch sử tìm kiếm', items: [{ title: 'celadon city' }] },
      { title: 'Tìm kiếm phổ biến', items: [{ title: 'aqua city' }, { title: 'biệt thự' }] }
    ];
    renderSuggestions(suggestionGroups);
  });

  popupSearchInput.addEventListener('blur', () => {
    // Cần một độ trễ nhỏ để sự kiện click vào gợi ý kịp hoạt động
    setTimeout(() => {
        suggestionsContainer.style.display = 'none';
    }, 200);
  });
  
  // Autocomplete khi gõ
  popupSearchInput.addEventListener('input', async () => {
    const query = popupSearchInput.value;
    if (query.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    const autocompleteItems = await fetchAutocompleteSuggestions(query);
    const suggestionGroups = [{ title: 'Gợi ý', items: autocompleteItems }];
    renderSuggestions(suggestionGroups);
  });

  // --- LOGIC CHUYỂN TRANG VÀ HIỂN THỊ KẾT QUẢ ---
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = popupSearchInput.value.trim();
    if (query) {
      // Trong ứng dụng thật, dòng này sẽ chuyển hướng:
      // window.location.href = `/search?q=${encodeURIComponent(query)}`;
      
      // Để demo trên một trang, chúng ta sẽ ẩn popup và hiển thị kết quả
      hidePopup();
      displaySearchResults(query);
    }
  });

  async function displaySearchResults(query) {
    mainContent.style.display = 'block';
    resultsPage.style.display = 'block';
    
    // Cập nhật giao diện
    document.getElementById('search-term').textContent = query;
    const resultsList = document.getElementById('results-list');
    const resultsCountEl = document.getElementById('results-count');
    const noResultsMessage = document.getElementById('no-results-message');
    
    resultsList.innerHTML = 'Đang tải kết quả...';
    noResultsMessage.style.display = 'none';

    // Gọi API mô phỏng
    const allHits = await fetchSearchResults(query);

    // Cập nhật số lượng
    resultsCountEl.textContent = allHits.length;
    
    if (allHits.length === 0) {
      noResultsMessage.style.display = 'block';
      resultsList.innerHTML = '';
    } else {
      renderResultsList(allHits);
    }
  }
  
  function renderResultsList(hits) {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = ''; // Xóa nội dung cũ
    hits.forEach(hit => {
        const hitElement = document.createElement('div');
        hitElement.className = 'hit';
        const typeText = hit.searchable_type.replace('_', ' ');
        const badge = `<span class="hit-type-badge badge-${hit.searchable_type}">${typeText}</span>`;
        const imageUrl = hit.image_url || 'https://via.placeholder.com/150';
        hitElement.innerHTML = `
          <img src="${imageUrl}" alt="${hit.title}" class="hit-image">
          <div class="hit-content">
            ${badge}
            <h2><a href="${hit.url}" target="_blank">${hit.title}</a></h2>
            <p>${hit.description || ''}</p>
          </div>
        `;
        resultsList.appendChild(hitElement);
    });
  }

  // Ban đầu ẩn trang kết quả đi
  resultsPage.style.display = 'none';
});
