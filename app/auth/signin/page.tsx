import { SignIn } from '@clerk/nextjs'
import { Container } from '@mantine/core'

export default function SignInPage() {
  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SignIn routing="hash" />
    </Container>
  )
}
