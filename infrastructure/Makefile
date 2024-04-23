deploy:
	set -o allexport; \
	source ".env"; \
	ansible-playbook -i inventory/hosts playbook.yml; \
	set +o allexport
