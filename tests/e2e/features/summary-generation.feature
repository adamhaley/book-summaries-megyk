Feature: Summary Generation and Management
  As an authenticated user
  I want to generate and manage book summaries
  So that I can access personalized summaries tailored to my preferences

  Background:
    Given I am signed in as "test@example.com"

  Scenario: User opens generate summary modal
    Given I am on the library page
    When I click "Get Summary" for a book without a default summary
    Then I should see the "Generate Summary" modal
    And the modal should display the book title
    And the modal should display the book author
    And the modal should show summary style options
    And the modal should show summary length options

  Scenario: User views summary customization options
    Given I have opened the generate summary modal for a book
    Then I should see style options:
      | Narrative      |
      | Bullet Points  |
      | Workbook       |
    And I should see length options:
      | Short (1 sentence/chapter)   |
      | Medium (1 paragraph/chapter) |
      | Long (1 page/chapter)        |

  Scenario: User generates summary with default preferences
    Given I have opened the generate summary modal
    And my user preferences are set to "Narrative" style and "Medium" length
    When the modal loads
    Then the style slider should default to "Narrative"
    And the length slider should default to "Medium"
    When I click "Generate Summary"
    Then the summary generation should start
    And I should see a loading indicator
    And the PDF should download when generation is complete

  Scenario: User generates summary with custom settings
    Given I have opened the generate summary modal
    When I select "Bullet Points" style
    And I select "Short" length
    And I click "Generate Summary"
    Then the summary should be generated with bullet points style
    And the summary should use short length format

  Scenario: User views their summaries
    Given I am on the dashboard
    When I navigate to "My Summaries" page
    Then I should see a list of all my generated summaries
    And each summary should display the book title
    And each summary should display the book author
    And each summary should display style badge
    And each summary should display length badge
    And each summary should display creation date
    And each summary should have a "Download" button
    And each summary should have a "Delete" button

  Scenario: User downloads a previously generated summary
    Given I am on the "My Summaries" page
    And I have at least one generated summary
    When I click the "Download" button for a summary
    Then the summary PDF should download immediately
    And the download should not require regeneration

  Scenario: User deletes a generated summary
    Given I am on the "My Summaries" page
    And I have at least one generated summary
    When I click the "Delete" button for a summary
    Then the summary should be removed from the list
    And the PDF file should be deleted from storage
    And I should see a confirmation message

  Scenario: User views empty summaries page
    Given I am on the "My Summaries" page
    And I have not generated any summaries yet
    Then I should see "No summaries yet" message
    And I should see a suggestion to visit the library

  Scenario: User generates multiple summaries for the same book
    Given I have already generated a summary for "The Great Gatsby"
    When I generate another summary for "The Great Gatsby" with different settings
    Then both summaries should be saved
    And I should see both summaries in my summaries list
    And each summary should show its unique settings

  Scenario: User updates their default preferences
    Given I am on the "Preferences" page
    When I change my default style to "Workbook"
    And I change my default length to "Long"
    And I save my preferences
    Then future summary generations should use these defaults
    When I open a generate summary modal
    Then the sliders should reflect the new defaults

  Scenario: Summary generation handles long processing time
    Given I have clicked "Generate Summary" for a large book
    When the generation takes longer than 10 seconds
    Then the loading indicator should remain visible
    And the browser should not timeout
    And the PDF should eventually download when complete

  Scenario: Summary generation displays metadata
    Given I am viewing my generated summaries
    When I view a summary entry
    Then I should see the generation time (if available)
    And I should see the creation timestamp
    And I should see the summary style and length used

  Scenario: User navigates from summary back to book library
    Given I am on the "My Summaries" page
    When I want to generate more summaries
    Then I should be able to navigate to the library page
    And I should be able to access the library from the dashboard menu
