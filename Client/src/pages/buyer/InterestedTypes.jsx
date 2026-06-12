import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import PublicService from '../../services/PublicService.js';

const flattenCategories = (items = []) => items.flatMap((item) => [item, ...flattenCategories(item.children || [])]);

const InterestedTypes = () => {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await PublicService.getCategories();
      setCategories(flattenCategories(response.data || []));
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Could not load categories.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <section>
      <PageHeader eyebrow="Interests" title="Book interests" description="Browse live categories from the marketplace catalogue." />
      {status === 'loading' && <LoadingState label="Loading categories..." />}
      {status === 'error' && <ErrorState message={error} onRetry={loadCategories} />}
      {status === 'ready' && categories.length === 0 && <EmptyState title="No categories found" />}
      {status === 'ready' && categories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} to={`/buyer/books?category_id=${category.id}`} className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] hover:bg-[var(--color-parchment-50)]">
              <h2 className="text-xl text-[var(--color-text-primary)]">{category.name}</h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{category.description || 'Explore books from this category.'}</p>
            </Link>
          ))}
        </div>
      )}
      <Link to="/buyer/books" className="mt-6 inline-flex"><Button>Browse all books</Button></Link>
    </section>
  );
};

export default InterestedTypes;
