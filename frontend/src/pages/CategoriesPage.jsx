import { useState, useCallback } from 'react';
import SectionCard from '../components/layout/SectionCard';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryList from '../components/categories/CategoryList';
import CategoryEditForm from '../components/categories/CategoryEditForm';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmModal from '../components/common/ConfirmModal';
import { useCategories } from '../hooks/useCategories';

const CategoriesPage = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleEditClick = useCallback((category) => {
    setEditingCategory(category);
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    const success = await updateCategory(id, data);
    if (success) {
      setEditingCategory(null);
    }
  }, [updateCategory]);

  const handleDeleteClick = useCallback((id) => {
    setCategoryToDelete(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (categoryToDelete) {
      const success = await deleteCategory(categoryToDelete);
      if (success) {
        setCategoryToDelete(null);
      }
    }
  }, [deleteCategory, categoryToDelete]);

  const cancelDelete = useCallback(() => {
    setCategoryToDelete(null);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Panel Lateral Izquierdo: Creación */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          <SectionCard title="Nueva Categoría">
            <CategoryForm onSubmit={createCategory} loading={loading} />
          </SectionCard>
        </div>

        {/* Panel Central: Lista */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {error && <ErrorMessage message={error} />}

          <SectionCard title="Base de Datos de Categorías">
            <CategoryList
              categories={categories}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </SectionCard>
        </div>
      </div>

      {/* Modales */}
      {editingCategory && (
        <CategoryEditForm
          category={editingCategory}
          onSubmit={handleUpdate}
          onCancel={() => setEditingCategory(null)}
          loading={loading}
        />
      )}

      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="¿Confirmas la eliminación definitiva de esta categoría?"
        message="Las tareas asociadas quedarán sin categoría. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={loading}
      />

      <footer className="mt-16 text-center text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-[0.3em]">
        © 2026 TaskFlow System // Universidad Tecnológica de Datos
      </footer>
    </div>
  );
};

export default CategoriesPage;