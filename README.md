# Vehicle Selection

## Gettin started

```bash
cd backend
npm install
npm start
```
this will start the backend server on port 3001

```bash
cd frontend
pnpm install
pnpm run dev
```

## Overview

This is a vehicle selection application that allows users to select a vehicle from a list of makes, models, and submodels.

## Design Decisions

### UX
I tried to keep the UX as simple as possible. This meant using a single select input where possible and a reusable form component.

### Context
I used context to store the vehicle data between steps. This allowed me to pass the vehicle data to the next step in the form. This was a trade off between using react-hook-form and context.

### Data Fetching
I used react-query to fetch the vehicle data, enabling me to use server side data fetching and caching.

### Type Safety / Form feedback
I used zod to validate the vehicle data, ensuring that the data is always valid. This is done on the client side giving the user instant feedback.


### Future Improvements
Enable pagination of the vehicle data for larger queries. In the vehicle makes select this would mean displaying the first 5 for example and allowing the user to load more.
More time smoothing out the UX.






