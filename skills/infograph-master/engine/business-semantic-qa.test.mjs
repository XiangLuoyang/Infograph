import assert from 'node:assert/strict';
import {auditBusinessSemantics} from './business-semantic-qa.mjs';
const cases=[
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2025-07",
              "value": 100
            },
            {
              "month": "2025-08",
              "value": 100
            },
            {
              "month": "2025-09",
              "value": 100
            },
            {
              "month": "2025-10",
              "value": 100
            },
            {
              "month": "2025-11",
              "value": 100
            },
            {
              "month": "2025-12",
              "value": 100
            }
          ],
          "observedValue": 0.2,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ]
        }
      ]
    },
    "declared-semantic-checks-pass",
    0
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2026-01",
              "value": 100
            },
            {
              "month": "2026-02",
              "value": 100
            },
            {
              "month": "2026-03",
              "value": 100
            },
            {
              "month": "2026-04",
              "value": 100
            },
            {
              "month": "2026-05",
              "value": 100
            },
            {
              "month": "2026-06",
              "value": 100
            }
          ],
          "observedValue": 0.2,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ]
        }
      ]
    },
    "semantic-check-failed",
    1
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [],
          "observedValue": 1,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ]
        }
      ]
    },
    "semantic-check-failed",
    1
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [],
          "observedValue": null,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ]
        }
      ]
    },
    "declared-semantic-checks-pass",
    0
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2025-07",
              "value": 0
            },
            {
              "month": "2025-08",
              "value": 0
            },
            {
              "month": "2025-09",
              "value": 0
            },
            {
              "month": "2025-10",
              "value": 0
            },
            {
              "month": "2025-11",
              "value": 0
            },
            {
              "month": "2025-12",
              "value": 0
            }
          ],
          "observedValue": 0,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ]
        }
      ]
    },
    "semantic-check-failed",
    1
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2025-07",
              "value": 100
            },
            {
              "month": "2025-08",
              "value": 100
            },
            {
              "month": "2025-09",
              "value": 100
            },
            {
              "month": "2025-10",
              "value": 100
            },
            {
              "month": "2025-11",
              "value": 100
            },
            {
              "month": "2025-12",
              "value": 100
            }
          ],
          "observedValue": 0.2,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "new",
              "cost": 120
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 36
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "allocates-differentially",
              "to": "strategy"
            }
          ]
        }
      ]
    },
    "semantic-check-failed",
    3
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2025-07",
              "value": 100
            },
            {
              "month": "2025-08",
              "value": 100
            },
            {
              "month": "2025-09",
              "value": 100
            },
            {
              "month": "2025-10",
              "value": 100
            },
            {
              "month": "2025-11",
              "value": 100
            },
            {
              "month": "2025-12",
              "value": 100
            }
          ],
          "observedValue": 0.2,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        }
      ]
    },
    "semantic-check-incomplete",
    0
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "not-applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2025-07",
              "value": 100
            },
            {
              "month": "2025-08",
              "value": 100
            },
            {
              "month": "2025-09",
              "value": 100
            },
            {
              "month": "2025-10",
              "value": 100
            },
            {
              "month": "2025-11",
              "value": 100
            },
            {
              "month": "2025-12",
              "value": 100
            }
          ],
          "observedValue": 0.2,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        }
      ]
    },
    "declared-semantic-checks-pass",
    0
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2025-07",
              "value": 100
            },
            {
              "month": "2025-08",
              "value": 100
            },
            {
              "month": "2025-09",
              "value": 100
            },
            {
              "month": "2025-10",
              "value": 100
            },
            {
              "month": "2025-11",
              "value": 100
            },
            {
              "month": "2025-12",
              "value": 100
            }
          ],
          "observedValue": 0.2,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "v",
          "kind": "value-parity",
          "unit": "CNY",
          "expectedValue": 100,
          "observedValue": 101,
          "tolerance": 0
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ]
        }
      ]
    },
    "semantic-check-failed",
    1
  ],
  [
    {
      "version": 1,
      "revision": 1,
      "coverage": [
        {
          "category": "calculation",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "expression",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        },
        {
          "category": "mechanism",
          "status": "applicable",
          "reason": "synthetic test coverage",
          "ref": "fixture"
        }
      ],
      "checks": [
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "g",
          "kind": "period-growth",
          "mode": "yoy",
          "current": [
            {
              "month": "2026-07",
              "value": 120
            },
            {
              "month": "2026-08",
              "value": 120
            },
            {
              "month": "2026-09",
              "value": 120
            },
            {
              "month": "2026-10",
              "value": 120
            },
            {
              "month": "2026-11",
              "value": 120
            },
            {
              "month": "2026-12",
              "value": 120
            }
          ],
          "baseline": [
            {
              "month": "2025-07",
              "value": 100
            },
            {
              "month": "2025-08",
              "value": 100
            },
            {
              "month": "2025-09",
              "value": 100
            },
            {
              "month": "2025-10",
              "value": 100
            },
            {
              "month": "2025-11",
              "value": 100
            },
            {
              "month": "2025-12",
              "value": 100
            }
          ],
          "observedValue": 0.3,
          "tolerance": 1e-9
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "b",
          "kind": "budget-cap",
          "budget": 100,
          "commitments": [
            {
              "id": "organic",
              "cost": 60
            },
            {
              "id": "new",
              "cost": 40
            }
          ]
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "c",
          "kind": "count-parity",
          "unit": "cells",
          "expectedValue": 48,
          "observedValue": 48
        },
        {
          "claim": "synthetic",
          "sourceRef": "fixture:source",
          "observationRef": "fixture:observed",
          "id": "r",
          "kind": "relation-fidelity",
          "modelRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ],
          "visualRelations": [
            {
              "from": "budget",
              "predicate": "scales",
              "to": "common-coverage"
            }
          ]
        }
      ]
    },
    "semantic-check-failed",
    1
  ]
];
const invalid=[
  {
    "version": 1,
    "revision": 1,
    "coverage": [
      {
        "category": "calculation",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "expression",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "mechanism",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      }
    ],
    "checks": [
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "g",
        "kind": "period-growth",
        "mode": "yoy",
        "current": [
          {
            "month": "2026-07",
            "value": 120
          },
          {
            "month": "2026-08",
            "value": 120
          },
          {
            "month": "2026-09",
            "value": 120
          },
          {
            "month": "2026-10",
            "value": 120
          },
          {
            "month": "2026-11",
            "value": 120
          },
          {
            "month": "2026-12",
            "value": 120
          }
        ],
        "baseline": [
          {
            "month": "2025-07",
            "value": 100
          },
          {
            "month": "2025-08",
            "value": 100
          },
          {
            "month": "2025-09",
            "value": 100
          },
          {
            "month": "2025-10",
            "value": 100
          },
          {
            "month": "2025-11",
            "value": 100
          },
          {
            "month": "2025-12",
            "value": 100
          }
        ],
        "observedValue": 0.2,
        "tolerance": 1e-9
      },
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "g",
        "kind": "period-growth",
        "mode": "yoy",
        "current": [
          {
            "month": "2026-07",
            "value": 120
          },
          {
            "month": "2026-08",
            "value": 120
          },
          {
            "month": "2026-09",
            "value": 120
          },
          {
            "month": "2026-10",
            "value": 120
          },
          {
            "month": "2026-11",
            "value": 120
          },
          {
            "month": "2026-12",
            "value": 120
          }
        ],
        "baseline": [
          {
            "month": "2025-07",
            "value": 100
          },
          {
            "month": "2025-08",
            "value": 100
          },
          {
            "month": "2025-09",
            "value": 100
          },
          {
            "month": "2025-10",
            "value": 100
          },
          {
            "month": "2025-11",
            "value": 100
          },
          {
            "month": "2025-12",
            "value": 100
          }
        ],
        "observedValue": 0.2,
        "tolerance": 1e-9
      }
    ]
  },
  {
    "version": 1,
    "revision": 1,
    "coverage": [
      {
        "category": "expression",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "mechanism",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      }
    ],
    "checks": [
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "g",
        "kind": "period-growth",
        "mode": "yoy",
        "current": [
          {
            "month": "2026-07",
            "value": 120
          },
          {
            "month": "2026-08",
            "value": 120
          },
          {
            "month": "2026-09",
            "value": 120
          },
          {
            "month": "2026-10",
            "value": 120
          },
          {
            "month": "2026-11",
            "value": 120
          },
          {
            "month": "2026-12",
            "value": 120
          }
        ],
        "baseline": [
          {
            "month": "2025-07",
            "value": 100
          },
          {
            "month": "2025-08",
            "value": 100
          },
          {
            "month": "2025-09",
            "value": 100
          },
          {
            "month": "2025-10",
            "value": 100
          },
          {
            "month": "2025-11",
            "value": 100
          },
          {
            "month": "2025-12",
            "value": 100
          }
        ],
        "observedValue": 0.2,
        "tolerance": 1e-9
      },
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "b",
        "kind": "budget-cap",
        "budget": 100,
        "commitments": [
          {
            "id": "organic",
            "cost": 60
          },
          {
            "id": "new",
            "cost": 40
          }
        ]
      },
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "c",
        "kind": "count-parity",
        "unit": "cells",
        "expectedValue": 48,
        "observedValue": 48
      },
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "r",
        "kind": "relation-fidelity",
        "modelRelations": [
          {
            "from": "budget",
            "predicate": "scales",
            "to": "common-coverage"
          }
        ],
        "visualRelations": [
          {
            "from": "budget",
            "predicate": "scales",
            "to": "common-coverage"
          }
        ]
      }
    ]
  },
  {
    "version": 1,
    "revision": 1,
    "coverage": [
      {
        "category": "calculation",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "expression",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "mechanism",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      }
    ],
    "checks": [
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "g",
        "kind": "period-growth",
        "mode": "yoy",
        "current": [
          {
            "month": "2026-07",
            "value": 1
          },
          {
            "month": "2026-09",
            "value": 1
          }
        ],
        "baseline": [
          {
            "month": "2025-07",
            "value": 100
          },
          {
            "month": "2025-08",
            "value": 100
          },
          {
            "month": "2025-09",
            "value": 100
          },
          {
            "month": "2025-10",
            "value": 100
          },
          {
            "month": "2025-11",
            "value": 100
          },
          {
            "month": "2025-12",
            "value": 100
          }
        ],
        "observedValue": 0.2,
        "tolerance": 1e-9
      }
    ]
  },
  {
    "version": 1,
    "revision": 1,
    "coverage": [
      {
        "category": "calculation",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "expression",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "mechanism",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      }
    ],
    "checks": [
      {
        "claim": "synthetic",
        "sourceRef": "fixture:source",
        "observationRef": "fixture:observed",
        "id": "c",
        "kind": "count-parity",
        "unit": "cells",
        "expectedValue": 48,
        "observedValue": 1.1
      }
    ]
  },
  {
    "version": 1,
    "revision": 1,
    "coverage": [
      {
        "category": "calculation",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "expression",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      },
      {
        "category": "mechanism",
        "status": "applicable",
        "reason": "synthetic test coverage",
        "ref": "fixture"
      }
    ],
    "checks": [
      {
        "claim": "synthetic",
        "sourceRef": "",
        "observationRef": "fixture:observed",
        "id": "g",
        "kind": "period-growth",
        "mode": "yoy",
        "current": [
          {
            "month": "2026-07",
            "value": 120
          },
          {
            "month": "2026-08",
            "value": 120
          },
          {
            "month": "2026-09",
            "value": 120
          },
          {
            "month": "2026-10",
            "value": 120
          },
          {
            "month": "2026-11",
            "value": 120
          },
          {
            "month": "2026-12",
            "value": 120
          }
        ],
        "baseline": [
          {
            "month": "2025-07",
            "value": 100
          },
          {
            "month": "2025-08",
            "value": 100
          },
          {
            "month": "2025-09",
            "value": 100
          },
          {
            "month": "2025-10",
            "value": 100
          },
          {
            "month": "2025-11",
            "value": 100
          },
          {
            "month": "2025-12",
            "value": 100
          }
        ],
        "observedValue": 0.2,
        "tolerance": 1e-9
      }
    ]
  }
];
for(const [p,s,n] of cases){const r=auditBusinessSemantics(p);assert.equal(r.status,s);assert.equal(r.failures.length,n)}
for(const p of invalid)assert.throws(()=>auditBusinessSemantics(p));
console.log('Business semantic QA: '+(cases.length+invalid.length)+' cases passed');
