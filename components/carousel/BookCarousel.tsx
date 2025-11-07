'use client';

import { useState, useEffect, useCallback } from 'react';
import { Carousel } from '@mantine/carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Container,
  Title,
  ActionIcon,
  Box
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconSparkles, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Book } from '@/lib/types/books';
import { GenerateSummaryModal } from '@/components/summary/GenerateSummaryModal';
import styles from './BookCarousel.module.css';

interface BookCarouselProps {
  books: Book[];
  title?: string;
  showTitle?: boolean;
}

// Placeholder for book covers - will be replaced with actual covers
const getBookCoverPlaceholder = (book: Book) => {
  if (book.cover_image_url) {
    return book.cover_image_url;
  }
  
  // Generate a consistent color based on book title
  const colors = ['3B82F6', '10B981', 'F59E0B', 'EF4444', '8B5CF6', '06B6D4'];
  const colorIndex = book.title.length % colors.length;
  
  return `https://placehold.co/300x450/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(book.title.slice(0, 20))}`;
};

// Fallback placeholder for failed images
const getFallbackPlaceholder = (book: Book) => {
  return `https://placehold.co/300x450/64748B/ffffff?text=${encodeURIComponent('Book Cover')}`;
};

export function BookCarousel({ books, title = "Featured Books", showTitle = true }: BookCarouselProps) {
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Media queries to match Mantine's breakpoints (aligned with slideSize)
  // Mantine breakpoints: sm=576px, md=768px, lg=992px
  const isLargeDesktop = useMediaQuery('(min-width: 992px)', true, { getInitialValueInEffect: false }); // lg: 25%
  const isMediumDesktop = useMediaQuery('(min-width: 768px)', true, { getInitialValueInEffect: false }); // md: 33.333%
  const isSmallTablet = useMediaQuery('(min-width: 576px)', true, { getInitialValueInEffect: false }); // sm: 45%
  // Below 576px is base: 85%

  // Determine if controls should be shown (when there are hidden books)
  const shouldShowControls = () => {
    const bookCount = books.length;

    if (isLargeDesktop) {
      // lg: ~4 slides visible at 25% each
      return bookCount > 4;
    } else if (isMediumDesktop) {
      // md: ~3 slides visible at 33.333% each
      return bookCount > 3;
    } else if (isSmallTablet) {
      // sm: ~2.22 slides visible at 45% each
      return bookCount > 2;
    } else {
      // base: ~1.17 slides visible at 85% each
      return bookCount > 1;
    }
  };

  // Determine if infinite loop should be enabled (needs extra books for smooth loop)
  const shouldEnableLoop = () => {
    const bookCount = books.length;

    if (isLargeDesktop) {
      // lg: need at least 6 books for smooth infinite loop
      return bookCount >= 6;
    } else if (isMediumDesktop) {
      // md: need at least 5 books for smooth infinite loop
      return bookCount >= 5;
    } else if (isSmallTablet) {
      // sm: need at least 4 books for smooth infinite loop
      return bookCount >= 4;
    } else {
      // base: need at least 3 books for smooth infinite loop
      return bookCount >= 3;
    }
  };

  const showControls = shouldShowControls();
  const enableLoop = shouldEnableLoop();

  // Update scroll button states when embla changes or on scroll
  const onSelect = useCallback(() => {
    if (!embla) return;
    setCanScrollPrev(embla.canScrollPrev());
    setCanScrollNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;

    onSelect();
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);

    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onSelect);
    };
  }, [embla, onSelect]);

  const handleGenerateSummary = (book: Book) => {
    setSelectedBook(book);
    setModalOpened(true);
  };

  const BookCard = ({ book }: { book: Book }) => (
    <Card 
      className={styles.bookCard}
      shadow="lg" 
      radius="md" 
      withBorder={false}
      p="sm"
    >
      <div className={styles.cardContent}>
        <div className={styles.imageContainer}>
          <Image
            src={getBookCoverPlaceholder(book)}
            fallbackSrc={getFallbackPlaceholder(book)}
            alt={`Cover of ${book.title}`}
            className={styles.coverImage}
            fit="cover"
            radius="md"
          />
          <div className={styles.overlay}>
            <Stack gap="xs" align="center">
              {/* <Text 
                size="lg" 
                fw={700} 
                c="white" 
                ta="center"
                className={styles.bookTitle}
              >
              sdasd  {book.title}
              </Text>
              <Text 
                size="sm" 
                c="rgba(255, 255, 255, 0.9)" 
                ta="center"
              >
                by {book.author} TEST
              </Text> */}
              {book.genre && (
                <Badge 
                  variant="filled" 
                  color="rgba(255, 255, 255, 0.2)"
                  c="white"
                  size="sm"
                >
                  {book.genre}
                </Badge>
              )}
              <Button
                variant="filled"
                color="rgba(255, 255, 255, 0.9)"
                c="dark"
                leftSection={<IconSparkles size={16} />}
                onClick={() => handleGenerateSummary(book)}
                size="sm"
                className={styles.generateButton}
              >
                Generate Summary
              </Button>
            </Stack>
          </div>
        </div>
      </div>
    </Card>
  );

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <Container size="xl" className={styles.carouselContainer}>
      {showTitle && (
        <Title order={2} mb="xl" ta="center" className={styles.carouselTitle}>
          {title} 
        </Title>
      )}
      
      <div className={styles.carouselWrapper}>
      <Carousel
        withIndicators={false}
        withControls={showControls}
        slideSize={{ base: '85%', sm: '45%', md: '33.333%', lg: '25%' }}
        slideGap="md"
        getEmblaApi={setEmbla}
        emblaOptions={{
          align: 'center',
          loop: enableLoop, // Only enable loop when we have enough slides for smooth looping
          skipSnaps: false,
          dragFree: false,
          duration: 25, // Faster transition for smoother loop jump
          containScroll: 'trimSnaps',
        }}
        classNames={{
          root: styles.carousel,
          viewport: styles.viewport,
          container: styles.container,
          slide: styles.slide,
          controls: styles.controls,
          control: styles.control,
        }}
        previousControlIcon={<IconChevronLeft size={24} />}
        nextControlIcon={<IconChevronRight size={24} />}
        previousControlProps={{
          style: {
            visibility: showControls && canScrollPrev ? 'visible' : 'hidden',
            pointerEvents: showControls && canScrollPrev ? 'auto' : 'none'
          }
        }}
        nextControlProps={{
          style: {
            visibility: showControls && canScrollNext ? 'visible' : 'hidden',
            pointerEvents: showControls && canScrollNext ? 'auto' : 'none'
          }
        }}
        controlsOffset={0}
        controlSize={50}
      >
        {books.map((book) => (
          <Carousel.Slide key={book.id}>
            <BookCard book={book} />
          </Carousel.Slide>
        ))}

      </Carousel>
            
      </div>

      <GenerateSummaryModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        book={selectedBook}
      />
    </Container>
  );
}