export const getItems = () => {
  const items = localStorage.getItem('lostFoundItems');
  return items ? JSON.parse(items) : [];
};

export const saveItems = (items) => {
  localStorage.setItem('lostFoundItems', JSON.stringify(items));
};

export const addItem = (item) => {
  const items = getItems();
  const newItem = {
    ...item,
    id: Date.now().toString(),
    dateReported: new Date().toISOString(),
    claimed: false
  };
  items.push(newItem);
  saveItems(items);
  return newItem;
};

export const updateItem = (id, updates) => {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveItems(items);
    return items[index];
  }
  return null;
};

export const deleteItem = (id) => {
  const items = getItems();
  const filteredItems = items.filter(item => item.id !== id);
  saveItems(filteredItems);
  return filteredItems;
};