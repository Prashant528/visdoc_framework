const graph_sequences = [
    {
      "sequence": "Setting Up Environment for Development",
      "edges": [
        {"source": "Get the source", "target": "Get code dependencies"},
        {"source": "Get code dependencies", "target": "Setup engine development environment"},
        {"source": "Setup engine development environment", "target": "Setup Goma"}
      ]
    },
    {
      "sequence": "Contributing to Issue Triage",
      "edges": [
        {"source": "Triage an issue", "target": "Learn team triage process"},
        {"source": "Learn team triage process", "target": "Determine actionable and non-actionable issues"},
        {"source": "Determine actionable and non-actionable issues", "target": "Handle duplicates"},
        {"source": "Handle duplicates", "target": "Assigning labels"},
        {"source": "Assigning labels", "target": "Attend critical triage meeting"},
        {"source": "Attend critical triage meeting", "target": "Issue hygiene"},
        {"source": "Issue hygiene", "target": "About comments"},
        {"source": "About comments", "target": "Locking an issue"},
        {"source": "Locking an issue", "target": "Priorities"},
        {"source": "Priorities", "target": "Assigning issues"},
        {"source": "Assigning issues", "target": "Closing issues"}
      ]
    },
    {
      "sequence": "Helping in Documentation",
      "edges": [
        {"source": "Read the style guide", "target": "Help in API documentation"},
        {"source": "Help in API documentation", "target": "Help in documentation issues"},
        {"source": "Help in documentation issues", "target": "Get the flutter design document template"}
      ]
    },
    {
      "sequence": "Contributing to API Development",
      "edges": [
        {"source": "Help in development", "target": "Help in Quality Assurance"}
      ]
    },
    {
      "sequence": "Joining the Community",
      "edges": [
        {"source": "Read Code of Conduct", "target": "Join discord"}
      ]
    }
  ]

export default graph_sequences