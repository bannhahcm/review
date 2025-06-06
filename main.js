document.addEventListener('DOMContentLoaded', () => {
  // --- TOÀN BỘ CODE CŨ CỦA BẠN SẼ NẰM BÊN TRONG NÀY ---

  // --- CÀI ĐẶT ---
  const API_URL = 'http://localhost:3000';
  const searchBox = document.getElementById('search-box');
  const statusDiv = document.getElementById('status');
  const hitsContainer = document.getElementById('hits-container');

  // --- HÀM TRỢ GIÚP ---
  function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  function renderResults(hits) {
    hitsContainer.innerHTML = ''; 
    if (hits.length === 0) {
      statusDiv.textContent = 'Không tìm thấy kết quả nào.';
      return;
    }
    statusDiv.textContent = `Tìm thấy ${hits.length} kết quả.`;
    hits.forEach(hit => {
      const hitElement = document.createElement('div');
      hitElement.className = 'hit';
      const typeText = hit.searchable_type.replace('_', ' ');
      const badge = `<span class="hit-type-badge badge-${hit.searchable_type}">${typeText}</span>`;
      const imageUrl = hit.image_url || 'https://via.placeholder.com/100';
      hitElement.innerHTML = `
        <img src="${imageUrl}" alt="${hit.title}" class="hit-image">
        <div class="hit-content">
          ${badge}
          <h2><a href="${hit.url}" target="_blank">${hit.title}</a></h2>
          <p>${hit.description || ''}</p>
        </div>
      `;
      hitsContainer.appendChild(hitElement);
    });
  }

  // --- HÀM TÌM KIẾM CHÍNH ---
  async function performSearch(query) {
    if (!query) {
      hitsContainer.innerHTML = '';
      statusDiv.textContent = 'Gõ để bắt đầu tìm kiếm...';
      return;
    }
    statusDiv.textContent = 'Đang tìm...';
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Lỗi mạng hoặc server API không phản hồi.');
      }
      const results = await response.json();
      renderResults(results);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      statusDiv.textContent = 'Không thể kết nối tới server tìm kiếm.';
    }
  }

  // --- LẮNG NGHE SỰ KIỆN ---
  const debouncedSearch = debounce(event => {
    performSearch(event.target.value);
  });
  
  // Dòng 89 của bạn nằm ở đây, bây giờ nó đã an toàn
  searchBox.addEventListener('input', debouncedSearch);

  statusDiv.textContent = 'Gõ để bắt đầu tìm kiếm...';

}); // <-- Thêm dấu ngoặc đóng này ở cuối tệp
