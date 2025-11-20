describe('User Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete user registration flow', () => {
    cy.intercept('POST', '/api/auth/register').as('registerRequest');

    cy.get('[data-testid="register-link"]').click();
    
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="confirm-password-input"]').type('password123');
    
    cy.get('[data-testid="register-button"]').click();
    
    cy.wait('@registerRequest').its('response.statusCode').should('eq', 201);
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'testuser');
  });

  it('should complete user login flow', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');

    // First, ensure user exists (you might want to use test data seeding)
    cy.get('[data-testid="login-link"]').click();
    
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    
    cy.get('[data-testid="login-button"]').click();
    
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-profile"]').should('be.visible');
  });

  it('should handle login errors gracefully', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Invalid credentials' }
    }).as('failedLogin');

    cy.get('[data-testid="login-link"]').click();
    
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    
    cy.get('[data-testid="login-button"]').click();
    
    cy.wait('@failedLogin');
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
  });
});