document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('memo-form');
    const titleInput = document.getElementById('memo-title');
    const contentInput = document.getElementById('memo-content');
    const idInput = document.getElementById('memo-id');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const memosGrid = document.getElementById('memos-grid');
    const memoCount = document.getElementById('memo-count');

    // State
    let memos = JSON.parse(localStorage.getItem('notespace_memos')) || [];

    // Initialize
    renderMemos();

    // Event Listeners
    form.addEventListener('submit', handleSaveMemo);
    cancelBtn.addEventListener('click', resetForm);

    // Functions
    function handleSaveMemo(e) {
        e.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const id = idInput.value;

        if (!title || !content) return;

        if (id) {
            // Update existing memo
            memos = memos.map(memo => 
                memo.id === id 
                    ? { ...memo, title, content, updatedAt: new Date().toISOString() }
                    : memo
            );
        } else {
            // Create new memo
            const newMemo = {
                id: crypto.randomUUID(),
                title,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            // Add to beginning of array
            memos.unshift(newMemo);
        }

        saveToLocalStorage();
        renderMemos();
        resetForm();
    }

    function deleteMemo(id) {
        memos = memos.filter(memo => memo.id !== id);
        saveToLocalStorage();
        renderMemos();
    }

    function editMemo(id) {
        const memo = memos.find(m => m.id === id);
        if (!memo) return;

        titleInput.value = memo.title;
        contentInput.value = memo.content;
        idInput.value = memo.id;

        saveBtn.innerHTML = "<i class='bx bx-check'></i> Update Memo";
        cancelBtn.classList.remove('hidden');
        
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function saveToLocalStorage() {
        localStorage.setItem('notespace_memos', JSON.stringify(memos));
    }

    function resetForm() {
        form.reset();
        idInput.value = '';
        saveBtn.innerHTML = "<i class='bx bx-save'></i> Save Memo";
        cancelBtn.classList.add('hidden');
    }

    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('ko-KR', options);
    }

    function renderMemos() {
        // Update count
        memoCount.textContent = memos.length;

        // Clear grid
        memosGrid.innerHTML = '';

        // Handle empty state
        if (memos.length === 0) {
            memosGrid.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-note'></i>
                    <h3>No notes yet</h3>
                    <p>Create your first elegant note above.</p>
                </div>
            `;
            return;
        }

        // Render cards
        memos.forEach(memo => {
            const card = document.createElement('div');
            card.className = 'memo-card';
            
            // Escape HTML to prevent XSS
            const safeTitle = escapeHTML(memo.title);
            const safeContent = escapeHTML(memo.content);

            card.innerHTML = `
                <h3 class="memo-title">${safeTitle}</h3>
                <div class="memo-date">
                    <i class='bx bx-time-five'></i>
                    ${formatDate(memo.updatedAt)}
                </div>
                <div class="memo-content">${safeContent}</div>
                <div class="memo-actions">
                    <button class="action-btn edit" data-id="${memo.id}" title="Edit">
                        <i class='bx bx-pencil'></i>
                    </button>
                    <button class="action-btn delete" data-id="${memo.id}" title="Delete">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            `;

            // Add Event Listeners for buttons
            const editBtn = card.querySelector('.edit');
            const deleteBtn = card.querySelector('.delete');

            editBtn.addEventListener('click', () => editMemo(memo.id));
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this memo?')) {
                    deleteMemo(memo.id);
                }
            });

            memosGrid.appendChild(card);
        });
    }

    // Utility for basic XSS prevention
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
