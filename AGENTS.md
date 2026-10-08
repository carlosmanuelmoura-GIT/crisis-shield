# Project architecture rules

- Crisis support resources are stored on each `crises` row and files live under `documents/crisis-support/<crisis-id>/`; this keeps template inheritance explicit and each cloned crisis independent.