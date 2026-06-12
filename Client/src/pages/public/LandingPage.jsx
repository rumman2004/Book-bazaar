import { useEffect, useMemo, useState } from 'react';
import BestSellerSection from '../../components/sections/BestSellerSection.jsx';
import FeaturedBooks from '../../components/sections/FeaturedBooks.jsx';
import HeroSection from '../../components/sections/HeroSection.jsx';
import SponsoredSection from '../../components/sections/SponsoredSection.jsx';
import SuggestedSection from '../../components/sections/SuggestedSection.jsx';
import PublicService from '../../services/PublicService.js';

const flattenCategories = (items = []) =>
  items.flatMap((item) => [
    { id: item.id, name: item.name },
    ...flattenCategories(item.children || []),
  ]);

const LandingPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const response = await PublicService.getCategories();
        if (mounted) setCategories(response.data || []);
      } catch {
        if (mounted) setCategories([]);
      }
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  return (
    <main>
      <HeroSection categories={flatCategories} />
      <FeaturedBooks />
      <SuggestedSection />
      <BestSellerSection />
      <SponsoredSection />
    </main>
  );
};

export default LandingPage;
