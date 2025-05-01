document.addEventListener("DOMContentLoaded", () => {
    const searchInput    = document.getElementById("searchInput");
    const searchButton   = document.getElementById("searchButton");
    const clearButton    = document.getElementById("clearButton");
    const buildingFilter = document.getElementById("buildingFilter");
    const floorFilter    = document.getElementById("floorFilter");
    const searchResults  = document.getElementById("searchResults");
    const noResults      = document.getElementById("noResults");
    const template       = document.getElementById("classroomTemplate");
  
    let classroomData = [];
  
    // 全角⇄半角統一＆小文字化
    const normalize = s => s.normalize('NFKC').toLowerCase();
  
    // JSON を読み込んで初期化
    fetch("data/classrooms.json")
      .then(res => res.json())
      .then(data => {
        classroomData = data;
        populateFilters();
        filterAndDisplay();
      })
      .catch(err => console.error("教室データ読み込み失敗:", err));
  
    // フィルター（建物／階）を生成
    function populateFilters() {
      const buildings = [...new Set(classroomData.map(c => c.building_name))];
      buildings.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        buildingFilter.appendChild(opt);
      });
  
      const floors = [...new Set(classroomData.map(c => String(c.floor_number)))]
                       .sort((a,b) => a - b);
      floors.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f;
        floorFilter.appendChild(opt);
      });
    }
  
    // フィルタ＆描画
    function filterAndDisplay() {
      const kw   = normalize(searchInput.value.trim());
      const bSel = buildingFilter.value;
      const fSel = floorFilter.value;
  
      const filtered = classroomData.filter(c => {
        const roomNum = normalize(String(c.room_number));
        const matchKw = roomNum.includes(kw);
        const matchB  = !bSel || c.building_name === bSel;
        const matchF  = !fSel || String(c.floor_number) === fSel;
        return matchKw && matchB && matchF;
      });
  
      searchResults.innerHTML = "";
      if (filtered.length === 0) {
        noResults.style.display = "block";
      } else {
        noResults.style.display = "none";
        filtered.forEach(c => {
          const clone = template.content.cloneNode(true);
          clone.querySelector(".room-name").textContent     = `教室 ${c.room_number}`;
          clone.querySelector(".building-name").textContent = c.building_name;
          clone.querySelector(".floor-number").textContent  = c.floor_number;
          clone.querySelector(".room-number").textContent   = c.room_number;
          searchResults.appendChild(clone);
        });
      }
    }
  
    // イベント登録
    searchInput.addEventListener("input", filterAndDisplay);
    searchButton.addEventListener("click", filterAndDisplay);
    buildingFilter.addEventListener("change", filterAndDisplay);
    floorFilter.addEventListener("change", filterAndDisplay);
  
    clearButton.addEventListener("click", () => {
      searchInput.value       = "";
      buildingFilter.value    = "";
      floorFilter.value       = "";
      filterAndDisplay();
    });
  });
  