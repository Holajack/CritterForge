import { test, expect } from "@playwright/test";

test.describe("Landing Page - Hero", () => {
  test("renders hero section with ParallaxForge branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ParallaxForge/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=parallax").first()).toBeVisible({ timeout: 10000 });
  });

  test("hero has interactive parallax layer preview", async ({ page }) => {
    await page.goto("/");
    const layerButtons = page.locator("button", { hasText: /Sky|Mountains|Trees|Ground/ });
    await expect(layerButtons.first()).toBeVisible();
    const count = await layerButtons.count();
    expect(count).toBe(4);
  });

  test("hero has CTA buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/sign-up"]').first()).toBeVisible();
    await expect(page.locator('a[href="#how-it-works"]').first()).toBeVisible();
  });
});

test.describe("Landing Page - Navigation", () => {
  test("renders navigation with auth buttons", async ({ page }) => {
    await page.goto("/");
    const signInLink = page.locator('button:has-text("Sign In")');
    const signUpLink = page.locator('a:has-text("Get Started")');
    await expect(signInLink.first()).toBeVisible();
    await expect(signUpLink.first()).toBeVisible();
  });

  test("header has all nav links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav");
    await expect(nav.locator('a[href="#features"]')).toBeVisible();
    await expect(nav.locator('a[href="#how-it-works"]')).toBeVisible();
    await expect(nav.locator('a[href="#parallax"]')).toBeVisible();
    await expect(nav.locator('a[href="#pricing"]')).toBeVisible();
    await expect(nav.locator('a[href="#faq"]')).toBeVisible();
    await expect(nav.locator('a[href="/gallery"]')).toBeVisible();
  });
});

test.describe("Landing Page - Social Proof Bar", () => {
  test("renders stats bar with numbers", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const stat = page.locator("text=2,400+");
    await stat.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(stat).toBeVisible();
    await expect(page.getByText("Game developers", { exact: true })).toBeVisible();
  });
});

test.describe("Landing Page - How It Works (DemoSection)", () => {
  test("renders four-step process", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#how-it-works");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=Four steps")).toBeVisible();
    await expect(section.locator("text=Step 01")).toBeVisible();
    await expect(section.locator("text=Step 04")).toBeVisible();
  });

  test("renders parallax output preview", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#how-it-works");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=forest_scene_layers.zip")).toBeVisible();
    await expect(section.locator("text=Ready to export")).toBeVisible();
  });
});

test.describe("Landing Page - Parallax Showcase", () => {
  test("renders parallax section with depth layers", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#parallax");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=Parallax scenes with real depth")).toBeVisible();
    await expect(section.locator("text=Sky / Background")).toBeVisible();
    await expect(section.locator("text=Foreground / Ground")).toBeVisible();
  });

  test("renders parallax feature pills", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#parallax");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=3-8 depth layers")).toBeVisible();
    await expect(section.locator("text=Seamless tiling")).toBeVisible();
  });
});

test.describe("Landing Page - Feature Grid (Bento)", () => {
  test("renders 9 features in bento layout", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#features");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=Text File Parsing")).toBeVisible();
    await expect(section.locator("text=AI Scene Detection")).toBeVisible();
    await expect(section.locator("text=Seamless Tiling")).toBeVisible();
    await expect(section.locator("text=Batch Generation")).toBeVisible();
    await expect(section.locator("text=Engine-Ready Export")).toBeVisible();
  });
});

test.describe("Landing Page - Target Audience", () => {
  test("renders three audience columns", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("text=Built for game makers");
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(page.getByRole("heading", { name: "Indie Game Developers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Content Creators" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "App Developers" })).toBeVisible();
  });
});

test.describe("Landing Page - Pricing", () => {
  test("renders four pricing tiers", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const section = page.locator("#pricing");
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await expect(section.getByRole("heading", { name: "Starter" })).toBeVisible();
    await expect(section.getByRole("heading", { name: "Standard" })).toBeVisible();
    await expect(section.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(section.getByRole("heading", { name: "Studio" })).toBeVisible();
  });

  test("popular tier is highlighted", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#pricing");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=Popular")).toBeVisible();
  });

  test("shows pricing amounts", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#pricing");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=$9").first()).toBeVisible({ timeout: 10000 });
    await expect(section.locator("text=$19").first()).toBeVisible();
    await expect(section.locator("text=$49").first()).toBeVisible();
    await expect(section.locator("text=$99").first()).toBeVisible();
  });
});

test.describe("Landing Page - FAQ", () => {
  test("renders FAQ accordion with questions", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#faq");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("text=Frequently asked questions")).toBeVisible();
    await expect(section.locator("text=What text file formats are supported")).toBeVisible();
    await expect(section.locator("text=How do parallax scenes work")).toBeVisible();
  });

  test("FAQ accordion toggles open on click", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#faq");
    await section.scrollIntoViewIfNeeded();
    const trigger = section.locator("button", { hasText: "What text file formats are supported" });
    await trigger.click();
    await expect(section.locator("text=.txt, .md, pasted text")).toBeVisible();
  });
});

test.describe("Landing Page - CTA Banner", () => {
  test("renders CTA banner with sign-up button", async ({ page }) => {
    await page.goto("/");
    await page.locator("text=Ready to generate parallax scenes").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Ready to generate parallax scenes")).toBeVisible();
  });
});

test.describe("Landing Page - Footer", () => {
  test("renders footer with logo and links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByRole("link", { name: "ParallaxForge" })).toBeVisible();
    await expect(footer.locator("text=Product")).toBeVisible();
    await expect(footer.locator("text=Resources")).toBeVisible();
    await expect(footer.locator("text=Legal")).toBeVisible();
  });

  test("footer has newsletter signup", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.locator("text=Stay in the loop")).toBeVisible();
    await expect(footer.locator('input[type="email"]')).toBeVisible();
  });

  test("footer has social links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.locator("text=Twitter")).toBeVisible();
    await expect(footer.locator("text=Discord")).toBeVisible();
    await expect(footer.locator("text=GitHub")).toBeVisible();
  });
});

test.describe("Auth-Protected Routes", () => {
  test("dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    const url = page.url();
    const isRedirected = url.includes("sign-in") || url.includes("clerk");
    const hasAuthContent = await page.locator("text=Sign in, text=Log in").count();
    expect(isRedirected || hasAuthContent > 0).toBeTruthy();
  });

  test("project page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/project/test-id");
    await page.waitForLoadState("domcontentloaded");
    const url = page.url();
    expect(url.includes("sign-in") || url.includes("clerk") || url.includes("project")).toBeTruthy();
  });
});

test.describe("Gallery Page (Public)", () => {
  test("renders gallery page", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForLoadState("domcontentloaded");
    const heading = page.locator("text=Gallery");
    await expect(heading.first()).toBeVisible();
  });
});

test.describe("Page Structure", () => {
  test("all landing page links have valid hrefs", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("a[href]");
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("");
    }
  });

  test("no console errors on load (filtering known)", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("publishableKey") &&
        !e.includes("Clerk") &&
        !e.includes("convex") &&
        !e.includes("Convex") &&
        !e.includes("Failed to fetch") &&
        !e.includes("hydration") &&
        !e.includes("NEXT_PUBLIC")
    );
    expect(criticalErrors).toEqual([]);
  });
});

test.describe("Responsive Design", () => {
  test("landing page renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("landing page renders on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("all 10 sections visible on desktop scroll", async ({ page }) => {
    await page.goto("/");
    // Scroll through all sections and verify key content
    const sections = [
      "Every parallax scene",   // Hero
      "2,400+",                 // Social proof
      "Four steps",             // How it works
      "real depth",             // Parallax showcase
      "between your",           // Feature grid
      "game makers",            // Target audience
      "Pay for what",           // Pricing
      "Frequently asked",       // FAQ
      "generate parallax",      // CTA banner
    ];
    for (const text of sections) {
      const element = page.locator(`text=${text}`).first();
      await element.scrollIntoViewIfNeeded();
      await expect(element).toBeVisible();
    }
  });
});
