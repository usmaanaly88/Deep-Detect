# Deep‑Detect — Conceptual Interview Preparation (30 Questions)

> These questions test **why** and **how** decisions were made — not syntax.  
> Use the answers as talking points, not scripts.

---

## 🧠 Section 1 — AI & Model Concepts (Q1–Q8)

---

**Q1. What does it mean for a model to "detect" an AI-generated image? What visual cues does it rely on?**

> AI‑generated images often contain subtle artifacts invisible to the human eye — unnatural skin textures, inconsistent lighting across the face, blurred or merged backgrounds, and irregular fine details like hair or teeth. A CNN learns to capture these patterns through its convolutional filters during training. The model doesn't "know" what it's looking for explicitly — it learns from thousands of examples of real vs. AI images which low-level and high-level features distinguish them.

---

**Q2. Why is this problem difficult? What makes it harder than, say, detecting cats vs. dogs?**

> Unlike natural categories, the boundary between AI and real images is not fixed — AI image generation improves constantly, so today's "AI artifacts" may disappear in the next version of Stable Diffusion or Midjourney. The model must learn subtle statistical fingerprints rather than obvious visual traits. There is also class imbalance in the real world (most images shared online are real), and the model must generalize to unseen generative models it was never trained on.

---

**Q3. What is a CNN and why is it suited for image classification tasks?**

> A Convolutional Neural Network (CNN) applies small learnable filters across an image to detect spatial patterns — edges, textures, shapes — in a hierarchical way. Early layers detect low-level features (edges, gradients) and later layers detect high-level semantic patterns (faces, objects). This spatial awareness and weight sharing make CNNs far more efficient and accurate than regular neural networks for images, since they preserve the 2D structure of visual data.

---

**Q4. What does "training" the model actually mean in this context?**

> Training means repeatedly showing the model labeled examples (AI images labeled 1, real images labeled 0), calculating how wrong its predictions are (using a loss function), and adjusting millions of internal weights slightly in the direction that reduces that error (gradient descent). Over thousands of iterations, the model's weights converge to values that allow it to generalize to images it hasn't seen before.

---

**Q5. Why normalize images with ImageNet mean and standard deviation during preprocessing?**

> The model's weights were calibrated to inputs in a certain numeric range and distribution. Normalizing with ImageNet statistics (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) ensures that every image fed to the model has roughly the same statistical properties the model was trained with. Without normalization, pixels could have wildly different value ranges across images, causing unstable or inaccurate predictions.

---

**Q6. What is confidence in a classification model and can it always be trusted?**

> Confidence is the model's probability estimate for its chosen class, derived from a softmax function over its output logits. A model may output 98% confidence even when it's wrong — this is called **overconfidence**. Models are often poorly calibrated, especially on out-of-distribution inputs (e.g., heavily edited images, cartoons). So confidence should be interpreted as a relative score rather than an absolute truth.

---

**Q7. What is overfitting and how would you detect it in this project?**

> Overfitting happens when the model memorizes the training data instead of learning generalizable patterns — it performs excellently on training examples but poorly on new ones. You detect it by monitoring training accuracy vs. validation accuracy over epochs. If training accuracy keeps rising but validation accuracy plateaus or drops, the model is overfitting. Fixes include adding dropout layers, data augmentation, or reducing model complexity.

---

**Q8. How would the model's performance degrade over time in a real-world deployment?**

> This is called **data drift**. As AI generators (Midjourney, DALL·E, Stable Diffusion) improve, the artifacts the model learned to detect may no longer appear. The model's accuracy would silently decline without any code change. To combat this, you need continuous monitoring of prediction confidence distributions, periodic retraining with new AI-generated image data, and human review pipelines for uncertain predictions.

---

## 🔌 Section 2 — Backend & API Concepts (Q9–Q16)

---

**Q9. Why is the model loaded once at server startup rather than per request?**

> Loading a model involves reading a large binary file from disk, allocating memory (sometimes GPU memory), and deserializing weights — this can take 2–10 seconds. If this happened per request, the API would be completely unusable at any meaningful scale. Loading once at startup means the model is always warm in memory, and each request only pays the cost of a forward pass (milliseconds).

---

**Q10. What happens if two users send images to the API at the exact same time?**

> FastAPI runs on an asynchronous ASGI server (Uvicorn). The `await file.read()` call yields control back to the event loop, allowing the server to begin reading the second request's file while the first is being read. The model inference itself is synchronous (CPU/GPU bound), so truly concurrent inferences may queue. For high concurrency, you'd use multiple Uvicorn workers or a dedicated model server like TorchServe.

---

**Q11. What is the difference between a stateful and stateless API, and which is Deep‑Detect?**

> A **stateful** API remembers past interactions (e.g., a shopping cart session). A **stateless** API treats every request as completely independent — no memory of previous calls. Deep‑Detect's `/predict` is stateless: each image upload is processed independently, the model holds no memory between calls, and any server instance can handle any request. This makes horizontal scaling trivial.

---

**Q12. Why use an async endpoint (`async def`) even though inference is CPU-bound?**

> The I/O steps — reading the uploaded file bytes — are async-friendly. The `await file.read()` call does not block the server thread, allowing Uvicorn to handle other incoming requests while bytes are being transferred. The inference itself is CPU/GPU bound, so it remains synchronous, but the async endpoint still improves throughput for the I/O portion, which matters under high concurrency.

---

**Q13. What is the purpose of the health-check endpoint (`GET /`) in a production system?**

> Load balancers, container orchestrators (Kubernetes), and monitoring tools (Prometheus, Uptime Robot) periodically poll a health endpoint. If it returns non-200, the system marks the instance as unhealthy and stops routing traffic to it. It also surfaces useful metadata — what device the model is running on, version info — without triggering expensive computation. It's essentially the system's "heartbeat."

---

**Q14. Why is error handling returned as JSON rather than letting exceptions propagate?**

> In a REST API, raw Python exceptions would crash the ASGI server or return a cryptic 500 response with no machine-readable body. By catching exceptions and returning structured JSON (`{"status": "error", "message": ...}`), the mobile client can parse the error programmatically and show the user a friendly message. It also prevents internal stack traces from being exposed to clients, which is a security concern.

---

**Q15. If you were to add user authentication to this API, where would it fit and why?**

> Authentication would fit as FastAPI **middleware** or as a **dependency injection** on protected routes. Middleware intercepts every request before it reaches the route handler, making it ideal for token validation (JWT/API keys). This way, authentication logic is centralized and doesn't need to be duplicated in each route handler. The `/predict` endpoint would declare an `Authorization` header dependency.

---

**Q16. What trade-offs come with allowing any file type to be uploaded to `/predict`?**

> Accepting only image MIME types restricts the attack surface, but MIME types can be spoofed by a client sending a malicious file with an `image/jpeg` header. A more robust approach is to actually attempt to open and decode the file with Pillow — if it fails, it's not a valid image. The current approach (checking content type + extension) is a reasonable first layer but should be combined with Pillow's own validation for production.

---

## 📱 Section 3 — Mobile Frontend Concepts (Q17–Q22)

---

**Q17. Why does the mobile app need to ask for permissions before accessing the camera or gallery?**

> Mobile operating systems (Android & iOS) enforce a **permission model** to protect user privacy. An app cannot access hardware (camera, microphone) or sensitive data (photos, contacts) without the user's explicit consent. Requesting permissions at runtime (when needed) rather than install-time improves trust — users understand why the permission is needed in context. Without granting permission, the OS will block the API call entirely.

---

**Q18. Why convert an image to `FormData` before sending to the backend, rather than sending raw bytes or base64?**

> `FormData` is the standard browser/mobile format for file uploads, built on the `multipart/form-data` encoding. It allows binary data to be safely transported over HTTP without encoding overhead. Base64 would inflate the file size by ~33% because it converts binary to ASCII. Raw bytes without proper encoding would require the server to know the exact byte boundaries. `multipart/form-data` is the correct, interoperable standard.

---

**Q19. What is the difference between developing for iOS and Android, and how does React Native bridge this?**

> iOS uses Swift/Objective-C and the UIKit/SwiftUI framework; Android uses Kotlin/Java and its own UI framework. Each has different APIs, UI components, and behavior. React Native provides a JavaScript abstraction layer that maps to native UI components on each platform — a `<Text>` in React Native becomes a `UILabel` on iOS and a `TextView` on Android. The JavaScript thread communicates with the native thread via a **bridge**, allowing one codebase to produce truly native UI.

---

**Q20. How does the app remain responsive (not freeze) while waiting for the server's prediction response?**

> The HTTP call is made asynchronously using `axios`. JavaScript in React Native runs on a single event loop, so blocking it with a synchronous network call would freeze the UI. By using `async/await` with axios, the app registers a callback and immediately returns control to the event loop. While waiting, the UI can still animate (e.g., show a loading spinner) because the JavaScript thread is free. The result is processed when the callback fires.

---

**Q21. What is the significance of user experience design in a technical project like this?**

> A technically accurate model is useless if users don't trust or use the interface. Good UX — clear feedback, loading states, confidence indicators, intuitive controls — directly impacts adoption. In Deep‑Detect, showing a confidence percentage alongside the prediction label helps users understand the model's certainty, which builds appropriate trust. Micro-animations signal interactivity and make the app feel polished rather than like a prototype.

---

**Q22. If the server is slow or unreachable, how should the mobile app respond?**

> The app should implement a **request timeout** (e.g., 15 seconds) via axios config. On timeout or network error, it should display a clear user-facing message ("Could not reach the server, please try again") rather than hanging. Ideally, it should also retry with exponential backoff for transient errors. This is a **graceful degradation** pattern — the app fails safely without crashing or confusing the user.

---

## 🏗️ Section 4 — System Design & Architecture Concepts (Q23–30)

---

**Q23. Why was a separate backend chosen instead of running the model directly on the mobile device (on-device ML)?**

> On-device ML (e.g., CoreML, TensorFlow Lite) would work but has limitations: the model must be small enough to fit on a phone, the phone's CPU/GPU is slower, and updating the model requires an app store release. A separate backend allows using a larger, more accurate model, updating the model without touching the app, running on powerful hardware (GPU servers), and centralizing compute costs. The trade-off is a network round-trip latency and a dependency on internet connectivity.

---

**Q24. What happens to the system if the backend server goes down?**

> All prediction functionality stops. The app would receive a network error and display a failure message. This is a **single point of failure**. Production mitigations include: running multiple backend instances behind a load balancer, using a container orchestrator (Kubernetes) that auto-restarts crashed pods, and setting up health-check alerts. There's no local fallback in the current architecture, which would be a valid area for future improvement.

---

**Q25. How is the system designed to handle model updates without downtime?**

> The model lives inside the Docker container. To update it, you build a new container image with the new `model.pt`, then perform a **rolling deployment** — the orchestrator gradually replaces old container instances with new ones, ensuring at least one instance is always serving traffic during the swap. Blue-green deployments are another pattern where the new version runs in parallel and traffic is switched atomically once verified.

---

**Q26. What does it mean for the API to be "stateless" and why does this matter for scaling?**

> Stateless means the server holds no information about past requests. Each request carries all the information needed to process it (the image file). Because there's no shared session state, any server instance can handle any request interchangeably. This is the fundamental property that allows **horizontal scaling** — adding more instances behind a load balancer without any synchronization overhead.

---

**Q27. What are the privacy implications of users uploading personal images to this service?**

> Images uploaded to `/predict` could contain sensitive personal content (faces, documents, private spaces). The current implementation doesn't persist images — they are processed in memory and discarded. However, a robust privacy policy should: explicitly state data is not stored, avoid logging image contents, ensure HTTPS in production, and comply with regulations (GDPR, CCPA). Adding an explicit `data retention = zero` guarantee would be a meaningful improvement.

---

**Q28. How does Docker improve this project's portability and consistency?**

> Docker packages the application code, its exact Python version, all library dependencies, and the OS-level environment into a single immutable image. This eliminates "it works on my machine" problems. The same image runs identically in a developer's laptop, a CI pipeline, or a production cloud server. The `requirements.txt` inside the container pins library versions, ensuring the model behaves the same everywhere it runs.

---

**Q29. How would you measure whether this system is working correctly in production?**

> Beyond uptime monitoring, you'd track: (1) **prediction distribution** — if 99% of images are suddenly classified as "ai," something is wrong; (2) **latency** per request; (3) **error rate** from the 500-error logs; (4) **confidence distribution** — a sudden drop in average confidence could signal the model is encountering out-of-distribution images; (5) periodic **human spot-checks** of predictions to catch model drift.

---

**Q30. If you had to improve this project for a production launch with 100,000 daily users, what would you change first and why?**

> The single most impactful change would be adding a **model server** (TorchServe or Triton Inference Server) to enable true parallel batch inference, replacing the single-instance Uvicorn process. Next would be adding a **CDN or pre-signed URL upload** pattern to offload file transfer from the API server. Finally, implementing **model versioning and A/B testing** infrastructure to safely roll out improved models without full redeployments. Security hardening (auth, rate limiting) would also be required at that scale.

---

*Best of luck with your defense! Focus on explaining the "why" behind every decision, not just what the code does.*
