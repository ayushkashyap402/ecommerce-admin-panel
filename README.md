# OutfitGo Admin Panel

A modern, responsive admin dashboard for managing the OutfitGo e-commerce platform. Built with React, Material-UI, and Redux Toolkit.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: Secure login with role-based access (Admin/Super Admin)
- **Dashboard Overview**: Real-time statistics and key metrics
- **Product Management**: CRUD operations for products and categories
- **Order Management**: Order tracking, status updates, and fulfillment
- **Analytics Dashboard**: Revenue, conversion rates, and business insights
- **Admin Management**: User management for super admins

### Technical Features
- **Microservices Architecture**: Seamless integration with backend services
- **Real-time Updates**: Live statistics via Server-Sent Events
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Material-UI components with custom theming
- **State Management**: Redux Toolkit for predictable state management
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/
│   ├── layout/          # Layout components (MainLayout, AuthLayout)
│   └── ui/             # Reusable UI components
├── pages/              # Page components
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProductsPage.jsx
│   ├── OrdersPage.jsx
│   ├── AnalyticsPage.jsx
│   └── AdminsPage.jsx
├── services/           # API service layer
│   ├── api.js          # Core API client
│   ├── authService.js  # Auth service methods
│   ├── productService.js
│   ├── orderService.js
│   ├── cartService.js
│   └── liveService.js  # Real-time updates
├── store/              # Redux store
│   ├── slices/         # Redux slices
│   └── index.js        # Store configuration
└── utils/              # Utility functions
```

### Backend Integration
The admin panel integrates with the following microservices via the API Gateway:

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend microservices running

### Environment Configuration
Create a `.env` file in the root directory:

```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Authentication


### Role-Based Access
- **Admin**: Access to dashboard, products, orders, and analytics
- **Super Admin**: All admin features plus admin management

## 📊 Features Overview

### Dashboard
- Real-time statistics (products, orders, revenue, users)
- Live data from backend services
- Key performance indicators
- Quick access to all features

### Product Management
- Create, read, update, delete products
- Category management
- Stock tracking
- Low stock alerts
- Product status management

### Order Management
- Order listing with filtering
- Status updates (pending, processing, shipped, delivered)
- Order details view
- Bulk operations
- Order statistics

### Analytics
- Revenue tracking
- Conversion rates
- Top-selling products
- Customer analytics
- Period-based reports (week, month, quarter, year)

### Admin Management (Super Admin only)
- Create and manage admin accounts
- Role assignment
- Admin status management
- Activity tracking

## 🔧 Development

### API Service Layer
The API service layer provides a clean interface to backend microservices:

```javascript
import { productService } from '../services/productService';

// Get all products
const products = await productService.getProducts();

// Create new product
const newProduct = await productService.createProduct(productData);
```

### State Management
Redux Toolkit is used for state management with slices for each domain:

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setProducts } from '../store/slices/productSlice';

const { products, loading } = useSelector(state => state.products);
```

### Real-time Updates
Live updates using Server-Sent Events:

```javascript
import { liveService } from '../services/liveService';

const eventSource = liveService.subscribeToLiveUpdates((data) => {
  // Handle live data updates
});
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Common Issues

1. **API Connection Issues**
   - Ensure backend services are running
   - Check API_URL in .env file
   - Verify CORS configuration

2. **Authentication Problems**
   - Check super admin credentials in backend
   - Verify JWT configuration
   - Check cookie settings

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Mode
Enable debug logging by setting:
```env
VITE_DEBUG=true
```

## 📱 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation
