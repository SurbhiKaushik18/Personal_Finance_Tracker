# Monthly Reports Feature

This feature adds automatic monthly financial summary reports to the Personal Finance Tracker application. Reports are stored in a SQLite database and can be viewed through the Reports page in the user interface.

## Features

- **Automatic Report Generation**: Monthly reports are automatically generated on the 1st day of each month
- **Manual Report Generation**: Users can manually generate reports for the current month
- **Historical Reports**: View reports from previous months
- **Detailed Category Analysis**: See which categories are over or under budget
- **Persistent Storage**: Reports are stored in a SQLite database for efficient retrieval

## Technical Implementation

### Database

Reports are stored in a SQLite database with the following schema:

#### monthly_reports Table
- `id`: Primary key
- `user_id`: User ID
- `year`: Year of the report
- `month`: Month of the report (1-12)
- `total_spent`: Total amount spent
- `total_budget`: Total budget amount
- `top_category`: Category with highest spending
- `budget_status`: Overall budget status (Over Budget, Near Budget, Under Budget)
- `created_at`: Report creation timestamp

#### category_reports Table
- `id`: Primary key
- `report_id`: Foreign key to monthly_reports
- `category`: Category name
- `amount_spent`: Amount spent in this category
- `budget_amount`: Budget amount for this category
- `is_over_budget`: Boolean flag indicating if over budget
- `percentage_used`: Percentage of budget used

### API Endpoints

- `POST /api/reports/generate`: Generate a report for a specific month/year
- `POST /api/reports/generate-current`: Generate a report for the current month
- `GET /api/reports/:year/:month`: Get a specific monthly report
- `GET /api/reports/recent/:count?`: Get recent reports (default: last 3 months)

### Scheduled Tasks

The application uses node-cron to schedule automatic report generation:
- Monthly reports are generated on the 1st day of each month at 00:05 AM
- Weekly database backup is performed every Sunday at 2 AM

## Usage

1. Navigate to the Reports page from the main navigation menu
2. View existing reports or generate a new report for the current month
3. Select a report to view detailed category breakdowns
4. Reports are color-coded to indicate budget status:
   - Green: Under Budget
   - Orange: Near Budget (>= 80% of budget)
   - Red: Over Budget

## Future Enhancements

- Export reports to PDF or Excel
- Email notifications for monthly reports
- Trend analysis across multiple months
- Custom reporting periods 