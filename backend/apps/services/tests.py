from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.accounts.models import User
from apps.churches.models import Church, ChurchMembership
from apps.ministries.models import Ministry, MinistryMembership
from apps.services.models import Service


class ServiceAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Usuários
        self.master = User.objects.create_user(
            email="master@revezo.com",
            password="test123456",
        )
        self.master.is_superuser = True
        self.master.is_staff = True
        self.master.save()

        self.church_admin = User.objects.create_user(
            email="admin@revezo.com",
            password="test123456",
        )

        self.ministry_admin = User.objects.create_user(
            email="ministry@revezo.com",
            password="test123456",
        )

        self.regular_user = User.objects.create_user(
            email="member@revezo.com",
            password="test123456",
        )

        # Igrejas
        self.church_1 = Church.objects.create(
            name="Igreja Central",
        )

        self.church_2 = Church.objects.create(
            name="Igreja Secundária",
        )

        # Administração da primeira igreja
        ChurchMembership.objects.create(
            user=self.church_admin,
            church=self.church_1,
            role=ChurchMembership.Role.ADMIN,
        )

        # O administrador de ministério é apenas membro da segunda igreja
        ChurchMembership.objects.create(
            user=self.ministry_admin,
            church=self.church_2,
            role=ChurchMembership.Role.MEMBER,
        )

        # Ministério administrado pelo usuário
        self.ministry = Ministry.objects.create(
            church=self.church_2,
            name="Louvor",
        )

        MinistryMembership.objects.create(
            user=self.ministry_admin,
            ministry=self.ministry,
            role=MinistryMembership.Role.ADMIN,
        )

        # Cultos existentes
        self.service_1 = Service.objects.create(
            church=self.church_1,
            name="Culto de Domingo",
            service_type=Service.ServiceType.FIXED,
            day_of_week=Service.Weekday.SUNDAY,
            time="19:00",
        )

        self.service_2 = Service.objects.create(
            church=self.church_2,
            name="Culto Especial",
            service_type=Service.ServiceType.SPECIAL,
            date="2026-12-20",
            time="18:00",
        )

        self.url = "/api/services/"

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def fixed_service_data(self):
        return {
            "church": self.church_1.id,
            "name": "Culto de Quarta",
            "service_type": "fixed",
            "day_of_week": 2,
            "date": None,
            "time": "20:00",
        }

    def special_service_data(self):
        return {
            "church": self.church_1.id,
            "name": "Culto Especial",
            "service_type": "special",
            "day_of_week": None,
            "date": "2026-12-25",
            "time": "19:00",
        }

    # Cadastro

    def test_church_admin_can_create_fixed_service(self):
        self.authenticate(self.church_admin)

        response = self.client.post(
            self.url,
            self.fixed_service_data(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Service.objects.filter(name="Culto de Quarta").exists())

    def test_church_admin_can_create_special_service(self):
        self.authenticate(self.church_admin)

        response = self.client.post(
            self.url,
            self.special_service_data(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fixed_service_requires_weekday(self):
        self.authenticate(self.church_admin)

        data = self.fixed_service_data()
        data["day_of_week"] = None

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fixed_service_cannot_have_specific_date(self):
        self.authenticate(self.church_admin)

        data = self.fixed_service_data()
        data["date"] = "2026-12-25"

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_special_service_requires_date(self):
        self.authenticate(self.church_admin)

        data = self.special_service_data()
        data["date"] = None

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_special_service_cannot_have_weekday(self):
        self.authenticate(self.church_admin)

        data = self.special_service_data()
        data["day_of_week"] = 2

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Permissões de listagem

    def test_master_can_list_all_services(self):
        self.authenticate(self.master)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_church_admin_can_only_list_own_church_services(self):
        self.authenticate(self.church_admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["id"],
            self.service_1.id,
        )

    def test_ministry_admin_cannot_list_services(self):
        self.authenticate(self.ministry_admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_regular_user_cannot_list_services(self):
        self.authenticate(self.regular_user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    # Permissões de cadastro

    def test_ministry_admin_cannot_create_service(self):
        self.authenticate(self.ministry_admin)

        response = self.client.post(
            self.url,
            {
                **self.fixed_service_data(),
                "church": self.church_2.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_regular_user_cannot_create_service(self):
        self.authenticate(self.regular_user)

        response = self.client.post(
            self.url,
            self.fixed_service_data(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Isolamento entre igrejas

    def test_church_admin_cannot_access_another_church_service(self):
        self.authenticate(self.church_admin)

        response = self.client.get(f"{self.url}{self.service_2.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_church_admin_cannot_transfer_service_to_another_church(self):
        self.authenticate(self.church_admin)

        response = self.client.patch(
            f"{self.url}{self.service_1.id}/",
            {"church": self.church_2.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.service_1.refresh_from_db()
        self.assertEqual(self.service_1.church_id, self.church_1.id)

    # Desativação lógica

    def test_church_admin_can_deactivate_service(self):
        self.authenticate(self.church_admin)

        response = self.client.delete(f"{self.url}{self.service_1.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.service_1.refresh_from_db()
        self.assertFalse(self.service_1.is_active)

    # Autenticação

    def test_unauthenticated_user_cannot_list_services(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
