describe('Post CRUD Operations', () => {
  beforeEach(() => {
    // Login first
    cy.login('test@example.com', 'password123');
    cy.visit('/posts');
  });

  it('should create a new post', () => {
    cy.intercept('POST', '/api/posts').as('createPost');

    cy.get('[data-testid="create-post-button"]').click();
    
    cy.get('[data-testid="post-title-input"]').type('My New Post');
    cy.get('[data-testid="post-content-textarea"]').type('This is the content of my new post');
    cy.get('[data-testid="post-category-select"]').select('technology');
    
    cy.get('[data-testid="submit-post-button"]').click();
    
    cy.wait('@createPost').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="post-list"]').should('contain', 'My New Post');
  });

  it('should update an existing post', () => {
    cy.intercept('PUT', '/api/posts/*').as('updatePost');

    cy.get('[data-testid="post-edit-button"]').first().click();
    
    cy.get('[data-testid="post-title-input"]').clear().type('Updated Post Title');
    cy.get('[data-testid="submit-post-button"]').click();
    
    cy.wait('@updatePost').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="post-list"]').should('contain', 'Updated Post Title');
  });

  it('should delete a post', () => {
    cy.intercept('DELETE', '/api/posts/*').as('deletePost');

    cy.get('[data-testid="post-delete-button"]').first().click();
    cy.get('[data-testid="confirm-delete-button"]').click();
    
    cy.wait('@deletePost').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="post-list"]').should('not.contain', 'Test Post');
  });
});