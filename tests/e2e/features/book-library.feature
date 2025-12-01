Feature: Book Library
  As an authenticated user
  I want to browse and interact with the book library
  So that I can discover books and generate summaries

  Background:
    Given I am signed in as "test@example.com"
    And I am on the library page

  Scenario: User views the book library
    Then I should see the page title "Discover Books"
    And I should see a list of books
    And each book should display a cover image
    And each book should display a title and author

  Scenario: User sorts books by title
    When I click the "Title" column header
    Then the books should be sorted by title in ascending order
    When I click the "Title" column header again
    Then the books should be sorted by title in descending order

  Scenario: User sorts books by author
    When I click the "Author" column header
    Then the books should be sorted by author name in ascending order

  Scenario: User sorts books by genre
    When I click the "Genre" column header
    Then the books should be sorted by genre in ascending order

  Scenario: User sorts books by publication year
    When I click the "Year" column header
    Then the books should be sorted by publication year in ascending order

  Scenario: User navigates through paginated books
    Given there are more than 10 books in the library
    When I am on page 1 of the book list
    And I click page 2 in the pagination
    Then I should see a different set of books
    And the page indicator should show "page 2"

  Scenario: User clicks book cover to get summary
    When I click on the first book cover
    Then I should see the pre-generated summary download or customization modal

  Scenario: User clicks "Get Summary" for book with default summary
    Given a book has a pre-generated default summary
    When I click the "Get Summary" button for that book
    Then the default summary PDF should start downloading

  Scenario: User clicks "Customize" to generate custom summary
    Given a book has a pre-generated default summary
    When I click the "Customize" button for that book
    Then I should see the "Generate Summary" modal
    And I should see style options
    And I should see length options

  Scenario: User generates custom summary for book without default
    Given a book does not have a pre-generated summary
    When I click the "Get Summary" button for that book
    Then I should see the "Generate Summary" modal
    And the modal should show the book title
    And the modal should show customization options

  Scenario: User views book details in mobile view
    Given I am viewing on a mobile device
    When I view the library page
    Then I should see books in a card layout
    And each card should show the book cover
    And each card should show title, author, and description
    And each card should show genre badge
    And each card should show action buttons

  Scenario: User views book details in desktop view
    Given I am viewing on a desktop device
    When I view the library page
    Then I should see books in a table layout
    And the table should have sortable columns
    And each row should show a clickable book cover

  Scenario: Library shows empty state when no books exist
    Given there are no books in the library
    When I visit the library page
    Then I should see "No books available yet" message
    And I should not see the books table

  Scenario: Library displays book count correctly
    Given there are 25 books in the library
    When I am on page 1
    Then I should see "Showing 10 of 25 books" at the bottom
    When I navigate to page 2
    Then I should see "Showing 10 of 25 books (page 2 of 3)" at the bottom
