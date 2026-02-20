# Clone your repo (if not already done)
git clone https://github.com/vibarjo/trilliox_landing-page.git
cd trilliox_landing-page

# Create the workflows directory
mkdir -p .github/workflows

# Create each file with the content above, then:
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows for testing and deployment"
git push origin main
