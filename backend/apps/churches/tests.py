from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from .models import Church, ChurchMembership
from apps.ministries.models import Ministry, MinistryMembership


User = get_user_model()


class ChurchMembershipTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="membro@exemplo.com",
            password="SenhaTeste123!",
        )

        self.church = Church.objects.create(
            name="Igreja Central",
        )

    def test_create_membership(self):
        membership = ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        self.assertEqual(membership.user, self.user)
        self.assertEqual(membership.church, self.church)
        self.assertTrue(membership.is_active)

    def test_user_can_have_multiple_churches(self):
        another_church = Church.objects.create(
            name="Igreja Secundária",
        )

        ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        ChurchMembership.objects.create(
            user=self.user,
            church=another_church,
        )

        self.assertEqual(
            ChurchMembership.objects.filter(user=self.user).count(),
            2,
        )

    def test_duplicate_membership_is_not_allowed(self):
        ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ChurchMembership.objects.create(
                    user=self.user,
                    church=self.church,
                )

    def test_inactive_membership_cannot_be_duplicated(self):
        ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
            is_active=False,
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ChurchMembership.objects.create(
                    user=self.user,
                    church=self.church,
                )

    def test_church_cannot_be_deleted_with_memberships(self):
        ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        with self.assertRaises(ProtectedError):
            self.church.delete()

    def test_user_cannot_be_deleted_with_memberships(self):
        ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        with self.assertRaises(ProtectedError):
            self.user.delete()


class ChurchAPITests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_superuser(
            email="master@exemplo.com",
            password="SenhaMaster123!",
        )

        self.user = User.objects.create_user(
            email="usuario@exemplo.com",
            password="SenhaUsuario123!",
        )

        self.list_url = reverse("church-list")

    def test_master_can_create_church(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.post(
            self.list_url,
            {"name": "Igreja Central"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(Church.objects.filter(name="Igreja Central").exists())

    def test_regular_user_cannot_create_church(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.list_url,
            {"name": "Igreja Não Autorizada"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertFalse(Church.objects.filter(name="Igreja Não Autorizada").exists())

    def test_unauthenticated_user_cannot_list_churches(self):
        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_master_can_list_churches(self):
        self.client.force_authenticate(user=self.master)

        Church.objects.create(name="Igreja Central")

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 1)

    def test_master_can_update_church(self):
        self.client.force_authenticate(user=self.master)

        church = Church.objects.create(name="Igreja Antiga")

        response = self.client.patch(
            reverse("church-detail", args=[church.pk]),
            {"name": "Igreja Atualizada"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        church.refresh_from_db()

        self.assertEqual(church.name, "Igreja Atualizada")

    def test_master_can_deactivate_church(self):
        self.client.force_authenticate(user=self.master)

        church = Church.objects.create(name="Igreja Central")

        response = self.client.patch(
            reverse("church-detail", args=[church.pk]),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        church.refresh_from_db()

        self.assertFalse(church.is_active)


class ChurchMembershipAPITest(APITestCase):
    def setUp(self):
        self.master = User.objects.create_superuser(
            email="master@exemplo.com",
            password="SenhaMaster123!",
        )
        self.user = User.objects.create_user(
            email="membro@exemplo.com",
            password="SenhaUsuario123!",
        )

        self.regular_user = User.objects.create_user(
            email="comum@exemplo.com",
            password="SenhaUsuario123!",
        )

        self.church = Church.objects.create(
            name="Igreja Central",
        )

        self.list_url = reverse("church-membership-list")

    def test_master_can_create_membership(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.post(
            self.list_url,
            {
                "user": self.user.pk,
                "church": self.church.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            ChurchMembership.objects.filter(
                user=self.user,
                church=self.church,
            ).exists()
        )

    def test_regular_user_cannot_create_membership(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.post(
            self.list_url,
            {
                "user": self.user.pk,
                "church": self.church.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_master_can_list_memberships(self):
        self.client.force_authenticate(user=self.master)

        ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 1)

    def test_duplicate_membership_is_rejected_by_api(self):
        self.client.force_authenticate(user=self.master)

        ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        response = self.client.post(
            self.list_url,
            {
                "user": self.user.pk,
                "church": self.church.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_user_cannot_be_linked(self):
        self.client.force_authenticate(user=self.master)

        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            self.list_url,
            {
                "user": self.user.pk,
                "church": self.church.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_church_cannot_receive_membership(self):
        self.client.force_authenticate(user=self.master)

        self.church.is_active = False
        self.church.save()

        response = self.client.post(
            self.list_url,
            {
                "user": self.user.pk,
                "church": self.church.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_master_can_deactivate_membership(self):
        self.client.force_authenticate(user=self.master)

        membership = ChurchMembership.objects.create(
            user=self.user,
            church=self.church,
        )

        response = self.client.patch(
            reverse(
                "church-membership-detail",
                args=[membership.pk],
            ),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        membership.refresh_from_db()

        self.assertFalse(membership.is_active)


class ChurchUserSearchAPITest(APITestCase):
    def setUp(self):
        self.master = User.objects.create_superuser(
            email="master@exemplo.com",
            password="SenhaMaster123!",
        )

        self.admin = User.objects.create_user(
            email="admin@exemplo.com",
            password="SenhaAdmin123!",
            first_name="Carlos",
            last_name="Administrador",
        )

        self.ministry_admin = User.objects.create_user(
            email="lider@exemplo.com",
            password="SenhaLider123!",
        )

        self.regular_user = User.objects.create_user(
            email="comum@exemplo.com",
            password="SenhaUsuario123!",
        )

        self.available_user = User.objects.create_user(
            email="joao@exemplo.com",
            password="SenhaUsuario123!",
            first_name="João",
            last_name="Silva",
        )

        self.church = Church.objects.create(
            name="Igreja Central",
        )

        self.another_church = Church.objects.create(
            name="Igreja Secundária",
        )

        ChurchMembership.objects.create(
            user=self.admin,
            church=self.church,
            role=ChurchMembership.Role.ADMIN,
        )

        ministry = Ministry.objects.create(
            church=self.church,
            name="Louvor",
        )

        MinistryMembership.objects.create(
            user=self.ministry_admin,
            ministry=ministry,
            role=MinistryMembership.Role.ADMIN,
        )

        self.search_url = reverse(
            "church-membership-search-users"
        )

    def search(self, user, church=None, email="joao"):
        self.client.force_authenticate(user=user)

        return self.client.get(
            self.search_url,
            {
                "church": church or self.church.pk,
                "email": email,
            },
        )

    def test_master_can_search_users(self):
        response = self.search(
            self.master,
            church=self.another_church.pk,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)

        self.assertEqual(
            response.data[0]["email"],
            "joao@exemplo.com",
        )

    def test_church_admin_can_search_users_in_own_church(self):
        response = self.search(self.admin)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)

    def test_church_admin_cannot_search_another_church(self):
        response = self.search(
            self.admin,
            church=self.another_church.pk,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_ministry_admin_cannot_search_users(self):
        response = self.search(self.ministry_admin)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_regular_user_cannot_search_users(self):
        response = self.search(self.regular_user)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_search_users(self):
        response = self.client.get(
            self.search_url,
            {
                "church": self.church.pk,
                "email": "joao",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_already_linked_user_is_not_returned(self):
        ChurchMembership.objects.create(
            user=self.available_user,
            church=self.church,
        )

        response = self.search(self.admin)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 0)

    def test_inactive_membership_user_is_not_returned(self):
        ChurchMembership.objects.create(
            user=self.available_user,
            church=self.church,
            is_active=False,
        )

        response = self.search(self.admin)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 0)

    def test_inactive_user_is_not_returned(self):
        self.available_user.is_active = False
        self.available_user.save()

        response = self.search(self.admin)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 0)

    def test_search_with_less_than_three_characters_returns_empty(self):
        response = self.search(
            self.admin,
            email="jo",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 0)

    def test_inactive_church_cannot_be_searched(self):
        self.church.is_active = False
        self.church.save()

        response = self.search(self.master)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_nonexistent_church_returns_not_found(self):
        response = self.search(
            self.master,
            church=99999,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_missing_church_parameter_returns_bad_request(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.get(
            self.search_url,
            {"email": "joao"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
