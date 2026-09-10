# Trading Journal

A full-stack trading journal and analytics platform for recording trades, reviewing performance, and identifying patterns in trading behavior.

## Overview

Trading Journal is an open-source project built around one simple idea: **trading performance should be analyzed beyond profit and loss.**

The application allows traders to record completed trades and analyze metrics such as:

* Win rate
* Average R
* Expectancy
* Profit factor
* Maximum drawdown
* Equity curve
* Performance by setup
* Performance by trading session
* Long vs. short performance

The project is also designed to support multiple traders in the same database, making it possible for friends and other users to log trades and compare different performance profiles.

This is primarily a learning project focused on building a real-world full-stack application from the ground up.

## Current Features

* Create trades
* Edit trades
* Delete trades
* View trade history
* Track entry, stop, and exit prices
* Track risk amount and R-multiple results
* Tag trades by setup
* Tag trades by trading session
* Track long and short positions
* Dashboard with performance metrics
* Dynamic equity curve
* Trading analytics
* Multiple trader profiles
* PostgreSQL database persistence
* REST API built with FastAPI

## Planned Features

The project is being developed incrementally. Planned features include:

* Advanced trade filtering and search
* Setup-specific analytics
* Session-specific analytics
* Long vs. short performance analysis
* Chart screenshot attachments
* Pre-trade and post-trade notes
* Trade mistake tracking
* Rule violation tracking
* Calendar-based performance view
* More advanced performance visualizations
* AI-powered analysis of historical trading data

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Recharts

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic

### Database

* PostgreSQL
* Neon

### Development

* Git
* GitHub
* Vite
* Pytest

## Architecture

The application follows a simple full-stack architecture:

```text
React + TypeScript
        ↓
     FastAPI
        ↓
    SQLAlchemy
        ↓
   PostgreSQL
```

The frontend communicates with the FastAPI backend through REST endpoints. The backend handles validation, database operations, and analytics, while PostgreSQL provides persistent storage for trade data.

## Analytics

The analytics engine calculates performance metrics from recorded trades rather than storing pre-calculated statistics.

Current metrics include:

* **Win Rate** — percentage of trades with a positive R result
* **Losing Rate** — percentage of trades with a negative R result
* **Average Win R** — average R returned by winning trades
* **Average Losing R** — average R returned by losing trades
* **Expectancy** — expected R per trade based on win rate, loss rate, and average outcomes
* **Profit Factor** — total winning R divided by the absolute value of total losing R
* **Maximum Drawdown** — largest peak-to-trough decline in cumulative R

The equity curve is generated from the chronological sequence of completed trades.

## Project Status

🚧 **In development**

The core trade management and analytics functionality is currently implemented.

The next stage of development focuses on improving the frontend experience, expanding analytics, and adding features that make reviewing trading behavior more useful.

## Goals

The primary goals of this project are to:

1. Build a practical full-stack application from scratch.
2. Develop stronger software engineering fundamentals.
3. Learn how frontend, backend, APIs, databases, and analytics work together.
4. Practice designing and structuring a real-world codebase.
5. Build meaningful analytics around trading performance.
6. Experiment with AI-assisted development and, eventually, AI-powered analysis.
7. Build an open-source project that other traders can actually use.

## Development Philosophy

This project is being built incrementally rather than generated as a single application.

The focus is on understanding the architecture, data flow, backend logic, database design, and engineering decisions behind the application while using modern AI-assisted development tools where they provide leverage.

## Disclaimer

This application is intended for trading journaling and performance analysis purposes only.

It does not provide financial advice, trading signals, investment recommendations, or guarantees of trading performance.

Trading involves substantial risk, and users are solely responsible for their own trading decisions.
