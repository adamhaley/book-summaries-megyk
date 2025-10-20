'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, Stack, Card, Table, Button, Badge, Loader, Alert } from '@mantine/core'
import { IconBook, IconAlertCircle, IconSparkles } from '@tabler/icons-react'
import { Book } from '@/lib/types/books'
import { GenerateSummaryModal } from '@/components/summary/GenerateSummaryModal'

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/v1/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
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

  const handleGenerateSummary = (book: Book) => {
    setSelectedBook(book)
    setModalOpened(true)
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md" style={{ minHeight: '400px', justifyContent: 'center' }}>
          <Loader size="lg" />
          <Text c="dimmed">Loading books...</Text>
        </Stack>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Book Library
          </Title>
          <Text size="lg" c="dimmed">
            Browse our collection of books and generate personalized summaries
          </Text>
        </div>

        {books.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center" gap="md" py="xl">
              <IconBook size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="lg" c="dimmed">No books available yet</Text>
            </Stack>
          </Card>
        ) : (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Author</Table.Th>
                    <Table.Th>Genre</Table.Th>
                    <Table.Th>Year</Table.Th>
                    <Table.Th>Pages</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {books.map((book) => (
                    <Table.Tr key={book.id}>
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
                          Generate Summary
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        )}

        <Text size="sm" c="dimmed">
          Showing {books.length} {books.length === 1 ? 'book' : 'books'}
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
