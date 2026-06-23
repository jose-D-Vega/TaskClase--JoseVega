import CategoryCard from './CategoryCard';
import Loading from '../common/Loading';

const CategoryList = ({ categories = [], loading, onEdit, onDelete }) => {
  if (loading && (!categories || categories.length === 0)) return <Loading />;

  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
          {Array.isArray(categories) ? 'No se encontraron categorías en el sector' : 'Error al cargar el listado de categorías'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CategoryList;