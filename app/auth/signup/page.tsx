import { SignUp } from '@clerk/nextjs'
import { Container } from '@mantine/core'

export default function SignUpPage() {
  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SignUp routing="hash" />
    </Container>
  )
}
