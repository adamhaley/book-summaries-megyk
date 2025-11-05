'use client';

import { useState, useRef } from 'react';
import { Carousel } from '@mantine/carousel';
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
          withControls={true}
          slideSize="300px"
          slideGap="lg"
          emblaOptions={{ loop: true }}
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