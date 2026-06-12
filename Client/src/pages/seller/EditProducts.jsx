import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../components/common/PageStates.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TextArea from '../../components/ui/TextArea.jsx';
import PublicService from '../../services/PublicService.js';
import SellerService from '../../services/SellerService.js';

const flattenCategories = (items = [], depth = 0) =>
  items.flatMap((item) => [{ id: item.id, name: item.name, depth }, ...flattenCategories(item.children || [], depth + 1)]);

const EditProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  useEffect(() => {
    const load = async () => {
      setStatus('loading');
      try {
        const [bookResponse, categoriesResponse] = await Promise.all([SellerService.getBookById(id), PublicService.getCategories()]);
        const book = bookResponse.data;
        setForm({
          title: book.title || '',
          author: book.author || '',
          isbn: book.isbn || '',
          description: book.description || '',
          price: book.price || '',
          condition: book.condition || 'new',
          stock_quantity: book.stock_quantity ?? 0,
          is_active: book.is_active,
          category_ids: (book.categories || []).map((category) => category.id),
        });
        setCategories(categoriesResponse.data || []);
        setStatus('ready');
      } catch (err) {
        setError(err.message || 'Could not load product.');
        setStatus('error');
      }
    };
    load();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleCategory = (categoryId) => setForm((current) => ({
    ...current,
    category_ids: current.category_ids.includes(categoryId) ? current.category_ids.filter((item) => item !== categoryId) : [...current.category_ids, categoryId],
  }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('saving');
    setError('');
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, key === 'category_ids' ? JSON.stringify(value) : value));
    if (image) payload.append('image', image);
    try {
      await SellerService.updateBook(id, payload);
      navigate('/seller/books');
    } catch (err) {
      setError(err.message || 'Could not update product.');
      setStatus('ready');
    }
  };

  if (status === 'loading') return <LoadingState label="Loading product..." />;
  if (status === 'error') return <ErrorState message={error} />;

  return (
    <section>
      <PageHeader eyebrow="Seller products" title="Edit book" description="Update listing details and inventory data." />
      <form onSubmit={submit} className="rounded-md border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Author" name="author" value={form.author} onChange={handleChange} required />
          <Input label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} />
          <Input label="Price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
          <Input label="Stock quantity" name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleChange} />
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-[#5a3e2b]">Condition</label>
            <select name="condition" value={form.condition} onChange={handleChange} className="mt-1.5 h-11 w-full rounded-sm border border-[#c9a97a] bg-[#fdf8f2] px-3 text-sm">
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="acceptable">Acceptable</option>
            </select>
          </div>
          <TextArea label="Description" name="description" value={form.description} onChange={handleChange} className="md:col-span-2" />
          <Input label="Replace cover image" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
          <label className="mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
            <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} /> Active listing
          </label>
        </div>
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#5a3e2b]">Categories</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {flatCategories.map((category) => (
              <button key={category.id} type="button" onClick={() => toggleCategory(category.id)} className={`rounded-full border px-3 py-1.5 text-sm ${form.category_ids.includes(category.id) ? 'border-[var(--color-ink-900)] bg-[var(--color-ink-900)] text-white' : 'border-[var(--color-border)] bg-[var(--color-parchment-50)] text-[var(--color-text-muted)]'}`}>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="mt-4 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={status === 'saving'} className="mt-6">Save changes</Button>
      </form>
    </section>
  );
};

export default EditProducts;
