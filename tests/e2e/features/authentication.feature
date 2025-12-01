Feature: User Authentication
  As a user of Megyk Books
  I want to sign in and sign up
  So that I can access personalized book summaries

  Background:
    Given the application is running

  Scenario: Unauthenticated user sees landing page
    When I visit the home page
    Then I should see the landing page
    And I should see "Book Summaries" in the hero title
    And I should see a "Get Started" button
    And I should see a "Sign In" button

  Scenario: User navigates to sign in from landing page
    Given I am on the home page
    When I click the "Sign In" button
    Then I should be redirected to the sign in page
    And I should see the "Sign In" page title

  Scenario: User navigates to sign in from Get Started
    Given I am on the home page
    When I click the "Get Started" button
    Then I should be redirected to the sign in page

  Scenario: User signs in with valid credentials
    Given I am on the sign in page
    When I enter email "test@example.com"
    And I enter password "testpassword123"
    And I click the submit button
    Then I should be redirected to the dashboard
    And I should see the dashboard library page

  Scenario: User signs in with invalid credentials
    Given I am on the sign in page
    When I enter email "invalid@example.com"
    And I enter password "wrongpassword"
    And I click the submit button
    Then I should see an error message
    And I should remain on the sign in page

  Scenario: User signs in with unconfirmed email
    Given I am on the sign in page
    When I enter email "unconfirmed@example.com"
    And I enter password "testpassword123"
    And I click the submit button
    Then I should see an error about email verification
    And the error should mention checking inbox

  Scenario: User navigates to sign up page
    Given I am on the sign in page
    When I click the "Sign up" link
    Then I should be redirected to the sign up page
    And I should see the "Sign Up" page title

  Scenario: Authenticated user is redirected from home page
    Given I am signed in as "test@example.com"
    When I visit the home page
    Then I should be automatically redirected to the dashboard
    And I should not see the landing page
