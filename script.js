/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

    console.log("Hello, world!");

// Classroom data management and search functionality
let classrooms = [];
let buildingOptions = new Set();
let floorOptions = new Set();

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const buildingFilter = document.getElementById('buildingFilter');
const floorFilter = document.getElementById('floorFilter');
const searchResults = document.getElementById('searchResults');
const noResults = document.getElementById('noResults');
const classroomTemplate = document.getElementById('classroomTemplate');

// Fetch classroom data
async function fetchClassrooms() {
  try {
    const response = await fetch('/data/classrooms.json');
    if (!response.ok) {
      throw new Error('Failed to fetch classroom data');
    }
    
    classrooms = await response.json();
    populateFilterOptions();
    renderResults(classrooms);
  } catch (error) {
    console.error('Error fetching classroom data:', error);
    searchResults.innerHTML = '<p class="error">教室データの読み込みに失敗しました。</p>';
  }
}

// Populate filter dropdown options
function populateFilterOptions() {
  // Clear existing options (keeping the "All" option)
  buildingFilter.innerHTML = '<option value="">すべて</option>';
  floorFilter.innerHTML = '<option value="">すべて</option>';
  
  // Get unique buildings and floors
  classrooms.forEach(classroom => {
    if (classroom.building_name) {
      buildingOptions.add(classroom.building_name);
    }
    
    if (classroom.floor_number !== undefined && classroom.floor_number !== null) {
      floorOptions.add(classroom.floor_number);
    }
  });
  
  // Add building options
  buildingOptions.forEach(building => {
    const option = document.createElement('option');
    option.value = building;
    option.textContent = building;
    buildingFilter.appendChild(option);
  });
  
  // Add floor options
  Array.from(floorOptions).sort((a, b) => a - b).forEach(floor => {
    const option = document.createElement('option');
    option.value = floor;
    option.textContent = floor;
    floorFilter.appendChild(option);
  });
}

// Search classrooms based on input and filters
function searchClassrooms() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedBuilding = buildingFilter.value;
  const selectedFloor = floorFilter.value ? parseInt(floorFilter.value) : '';
  
  const filteredClassrooms = classrooms.filter(classroom => {
    // Apply building filter
    if (selectedBuilding && classroom.building_name !== selectedBuilding) {
      return false;
    }
    
    // Apply floor filter
    if (selectedFloor !== '' && classroom.floor_number !== selectedFloor) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const roomName = (classroom.room_name || '').toLowerCase();
      const buildingName = (classroom.building_name || '').toLowerCase();
      const roomNumber = classroom.room_number ? classroom.room_number.toString() : '';
      
      return roomName.includes(searchTerm) || 
             buildingName.includes(searchTerm) || 
             roomNumber.includes(searchTerm);
    }
    
    return true;
  });
  
  renderResults(filteredClassrooms);
}

// Render search results
function renderResults(results) {
  // Clear previous results
  searchResults.innerHTML = '';
  
  if (results.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  
  noResults.style.display = 'none';
  
  // Render each classroom
  results.forEach(classroom => {
    const classroomElement = document.importNode(classroomTemplate.content, true);
    
    classroomElement.querySelector('.room-name').textContent = classroom.room_name || '名称なし';
    classroomElement.querySelector('.building-name').textContent = classroom.building_name || '---';
    classroomElement.querySelector('.floor-number').textContent = classroom.floor_number !== null ? classroom.floor_number : '---';
    classroomElement.querySelector('.room-number').textContent = classroom.room_number !== null ? classroom.room_number : '---';
    
    searchResults.appendChild(classroomElement);
  });
}

// Event listeners
searchButton.addEventListener('click', searchClassrooms);
searchInput.addEventListener('keyup', event => {
  if (event.key === 'Enter') {
    searchClassrooms();
  }
});

buildingFilter.addEventListener('change', searchClassrooms);
floorFilter.addEventListener('change', searchClassrooms);

// Initialize data when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchClassrooms);