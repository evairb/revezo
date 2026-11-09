from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

User = get_user_model()


class RegisterAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("register")
        self.valid_data = {
            "email": "novo@example.com",
            "first_name": "Novo",
            "last_name": "Usuario",
            "password": "SenhaSegura123",
        }

    def test_user_can_register(self):
        response = self.client.post(self.url, self.valid_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="novo@example.com").exists())

    def test_registered_user_password_is_hashed(self):
        self.client.post(self.url, self.valid_data, format="json")

        user = User.objects.get(email="novo@example.com")

        self.assertNotEqual(user.password, "SenhaSegura123")
        self.assertTrue(user.check_password("SenhaSegura123"))

    def test_password_is_not_returned(self):
        response = self.client.post(self.url, self.valid_data, format="json")

        self.assertNotIn("password", response.data)

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(email="novo@example.com", password="OutraSenha123")

        response = self.client.post(self.url, self.valid_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_is_not_staff_or_superuser(self):
        self.client.post(self.url, self.valid_data, format="json")

        user = User.objects.get(email="novo@example.com")

        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_registration_does_not_create_church_membership(self):
        self.client.post(self.url, self.valid_data, format="json")

        user = User.objects.get(email="novo@example.com")

        self.assertEqual(user.church_memberships.count(), 0)
