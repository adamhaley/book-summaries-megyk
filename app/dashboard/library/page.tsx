'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, Stack, Card, Table, Button, Badge, Loader, Alert, SimpleGrid, Group, Box, Pagination, Center, UnstyledButton, Image } from '@mantine/core'
import { IconBook, IconAlertCircle, IconSparkles, IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'
import { Book } from '@/lib/types/books'
import { GenerateSummaryModal } from '@/components/summary/GenerateSummaryModal'
import styles from './library.module.css'

// Helper functions for book covers (same as carousel)
const getBookCoverPlaceholder = (book: Book) => {
  if (book.cover_image_url) {
    return book.cover_image_url;
  }
  
  // Generate a consistent color based on book title
  const colors = ['3B82F6', '10B981', 'F59E0B', 'EF4444', '8B5CF6', '06B6D4'];
  const colorIndex = book.title.length % colors.length;
  
  return `https://placehold.co/300x450/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(book.title.slice(0, 20))}`;
};

const getFallbackPlaceholder = (book: Book) => {
  return `https://placehold.co/300x450/64748B/ffffff?text=${encodeURIComponent('Book Cover')}`;
};

// Sorting function following Mantine pattern
function sortData(
  data: Book[],
  payload: { sortBy: keyof Book | null; reversed: boolean }
) {
  const { sortBy } = payload

  if (!sortBy) {
    return data
  }

  return [...data].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    // Convert to strings for comparison
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    
    if (payload.reversed) {
      return bStr.localeCompare(aStr)
    }
    
    return aStr.localeCompare(bStr)
  })
}

// Client-side pagination
function paginateData(data: Book[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: data.slice(start, end),
    totalPages: Math.ceil(data.length / pageSize)
  }
}

export default function LibraryPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]) // All data from API
  const [sortedData, setSortedData] = useState<Book[]>([]) // Sorted data
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]) // Paginated data for display
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  
  // Sorting state
  const [sortBy, setSortBy] = useState<keyof Book | null>(null)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)
  
  // Pagination state
  const [activePage, setActivePage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10

  useEffect(() => {
    fetchAllBooks()
  }, [])

  const fetchAllBooks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v1/books?all=true')
      if (response.ok) {
        const data = await response.json()
        const books = data.books || []
        setAllBooks(books)
        setSortedData(books)
        
        // Set initial pagination
        const { data: paginatedData, totalPages: pages } = paginateData(books, 1, pageSize)
        setDisplayedBooks(paginatedData)
        setTotalPages(pages)
      } else {
        setError('Failed to load books')
      }
    } catch (err) {
      console.error('Error fetching books:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const setSorting = (field: keyof Book) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
    
    // Sort the data
    const sorted = sortData(allBooks, { sortBy: field, reversed })
    setSortedData(sorted)
    
    // Reset to first page and paginate
    setActivePage(1)
    const { data: paginatedData, totalPages: pages } = paginateData(sorted, 1, pageSize)
    setDisplayedBooks(paginatedData)
    setTotalPages(pages)
  }

  const handlePageChange = (page: number) => {
    setActivePage(page)
    const { data: paginatedData } = paginateData(sortedData, page, pageSize)
    setDisplayedBooks(paginatedData)
  }

  const getSortIcon = (column: keyof Book) => {
    if (sortBy !== column) {
      return <IconSelector size={14} />
    }
    return reverseSortDirection ? <IconChevronDown size={14} /> : <IconChevronUp size={14} />
  }

  const handleGenerateSummary = (book: Book) => {
    setSelectedBook(book)
    setModalOpened(true)
  }

  if (loading) {
    return (
      <Container size="xl" pt="0" pb="xl">
        <Stack align="center" gap="md" style={{ minHeight: '400px', justifyContent: 'center' }}>
          <Loader size="lg" />
          <Text c="dimmed">Loading books...</Text>
        </Stack>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl" pt="0" pb="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" pt="0" pb="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs" c="#FFFFFF">
            Discover Books
          </Title>
          <Text size="lg" c="#AAAAAA">
            Explore our collection and get instant summaries
          </Text>
        </div>

        {allBooks.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center" gap="md" py="xl">
              <IconBook size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="lg" c="dimmed">No books available yet</Text>
            </Stack>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <Box className={styles.mobileView}>
            <SimpleGrid cols={1} spacing="md">
              {displayedBooks.map((book) => (
                <Card key={book.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group align="flex-start" gap="md" wrap="nowrap">
                    {/* Book Cover - Clickable */}
                    <Box
                      className={styles.bookCoverMobile}
                      onClick={() => handleGenerateSummary(book)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Image
                        src={getBookCoverPlaceholder(book)}
                        fallbackSrc={getFallbackPlaceholder(book)}
                        alt={`Cover of ${book.title}`}
                        fit="cover"
                        radius="md"
                        h={120}
                        w={80}
                      />
                    </Box>
                    
                    {/* Book Details */}
                    <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
                      <div>
                        <Text fw={600} size="lg" lineClamp={2}>{book.title}</Text>
                        <Text c="dimmed" size="sm">by {book.author}</Text>
                        {book.description && (
                          <Text size="sm" c="dimmed" mt="xs" lineClamp={2}>
                            {book.description}
                          </Text>
                        )}
                      </div>
                      
                      <Group justify="space-between" align="flex-start" wrap="wrap">
                        <Stack gap="xs">
                          {book.genre && (
                            <Badge variant="light" size="sm">
                              {book.genre}
                            </Badge>
                          )}
                          <Group gap="md">
                            {book.publication_year && (
                              <Text size="xs" c="dimmed">
                                {book.publication_year}
                              </Text>
                            )}
                            {book.page_count && (
                              <Text size="xs" c="dimmed">
                                {book.page_count} pages
                              </Text>
                            )}
                          </Group>
                        </Stack>
                        
                        <Button
                          size="sm"
                          variant="light"
                          leftSection={<IconSparkles size={16} />}
                          onClick={() => handleGenerateSummary(book)}
                          style={{ flexShrink: 0 }}
                        >
                          Get Summary
                        </Button>
                      </Group>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
          
          {/* Desktop Table View */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.desktopView}>
            <Table.ScrollContainer minWidth={900}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 100 }}>Cover</Table.Th>
                    <Table.Th>
                      <UnstyledButton 
                        onClick={() => setSorting('title')} 
                        className={styles.sortableHeader}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, width: '100%' }}
                      >
                        Title {getSortIcon('title')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton 
                        onClick={() => setSorting('author')} 
                        className={styles.sortableHeader}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, width: '100%' }}
                      >
                        Author {getSortIcon('author')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton 
                        onClick={() => setSorting('genre')} 
                        className={styles.sortableHeader}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, width: '100%' }}
                      >
                        Genre {getSortIcon('genre')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton 
                        onClick={() => setSorting('publication_year')} 
                        className={styles.sortableHeader}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, width: '100%' }}
                      >
                        Year {getSortIcon('publication_year')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton 
                        onClick={() => setSorting('page_count')} 
                        className={styles.sortableHeader}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, width: '100%' }}
                      >
                        Pages {getSortIcon('page_count')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {displayedBooks.map((book) => (
                    <Table.Tr key={book.id}>
                      <Table.Td>
                        <Box
                          onClick={() => handleGenerateSummary(book)}
                          style={{ cursor: 'pointer', display: 'inline-block' }}
                        >
                          <Image
                            src={getBookCoverPlaceholder(book)}
                            fallbackSrc={getFallbackPlaceholder(book)}
                            alt={`Cover of ${book.title}`}
                            fit="cover"
                            radius="sm"
                            h={80}
                            w={60}
                            className={styles.bookCover}
                          />
                        </Box>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600}>{book.title}</Text>
                        {book.description && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {book.description}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>{book.author}</Table.Td>
                      <Table.Td>
                        {book.genre ? (
                          <Badge variant="light" size="sm">
                            {book.genre}
                          </Badge>
                        ) : (
                          <Text c="dimmed" size="sm">—</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {book.publication_year || <Text c="dimmed" size="sm">—</Text>}
                      </Table.Td>
                      <Table.Td>
                        {book.page_count || <Text c="dimmed" size="sm">—</Text>}
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconSparkles size={14} />}
                          onClick={() => handleGenerateSummary(book)}
                        >
                          Get Summary
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
          </>
        )}

        {totalPages > 1 && (
          <Center>
            <Pagination
              total={totalPages}
              value={activePage}
              onChange={handlePageChange}
              size="sm"
            />
          </Center>
        )}

        <Text size="sm" c="dimmed" ta="center">
          Showing {displayedBooks.length} of {allBooks.length} {allBooks.length === 1 ? 'book' : 'books'}
          {totalPages > 1 && (
            <> (page {activePage} of {totalPages})</>
          )}
        </Text>
      </Stack>

      <GenerateSummaryModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        book={selectedBook}
      />
    </Container>
  )
}
