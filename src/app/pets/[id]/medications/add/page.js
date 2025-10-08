"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../../contexts/AuthContext";
import { getPetById } from "../../../../../services/petService";
import { createMedication } from "../../../../../services/medicationService";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import Navbar from "../../../../../components/Navbar";
import FeatureErrorBoundary from "../../../../../components/FeatureErrorBoundary";
import {
  Container,
  Heading,
  Text,
  Flex,
  Card,
  TextField,
  Button,
  Box,
  Grid,
  Select,
  TextArea,
  Checkbox,
} from "@radix-ui/themes";

export default function AddMedication() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    instructions: "",
    prescribedBy: {
      id: "",
      name: "",
    },
    status: "active",
    reminderEnabled: true,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is authenticated and fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petData = await getPetById(petId);
        setPet(petData);
      } catch (err) {
        console.error("Error fetching pet details:", err);
        setError("Failed to load pet details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [user, router, petId]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      // Prepare medication data to match the backend DTO
      const medicationData = {
        petId,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
        instructions: formData.instructions,
        prescribedBy: {
          id: formData.prescribedBy.id,
          name: formData.prescribedBy.name,
        },
        status: formData.status,
        reminderEnabled: formData.reminderEnabled,
        notes: formData.notes || "",
      };

      // Call API to create medication
      const newRecord = await createMedication(medicationData);

      // Redirect back to pet details page
      router.push(`/pets/${petId}?tab=medications`);
    } catch (err) {
      console.error("Error adding medication:", err);
      setError("Failed to add medication. Please try again.");
      setIsSaving(false);
    }
  };

  const addMedicationContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">
              Add Medication for {pet?.name || "Pet"}
            </Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading pet details...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="name">
                      Medication Name*
                    </Text>
                    <TextField.Root
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter medication name"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="dosage">
                      Dosage* (include unit, e.g., &quot;50mg&quot;)
                    </Text>
                    <TextField.Root
                      id="dosage"
                      value={formData.dosage}
                      onChange={handleChange}
                      placeholder="Enter dosage with unit (e.g., 50mg, 2 tablets)"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="frequency">
                      Frequency*
                    </Text>
                    <TextField.Root
                      id="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      placeholder="e.g., Twice daily, Once daily, Every 8 hours"
                      required
                    />
                  </Box>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="startDate">
                        Start Date*
                      </Text>
                      <TextField.Root
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="endDate">
                        End Date
                      </Text>
                      <TextField.Root
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1">
                      Prescribed By
                    </Text>
                    <Grid columns="2" gap="4">
                      <Box>
                        <Text as="label" size="1" mb="1" htmlFor="prescriberId">
                          Prescriber ID
                        </Text>
                        <TextField.Root
                          id="prescriberId"
                          value={formData.prescribedBy.id}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              prescribedBy: {
                                ...prev.prescribedBy,
                                id: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g., vet456"
                        />
                      </Box>
                      <Box>
                        <Text
                          as="label"
                          size="1"
                          mb="1"
                          htmlFor="prescriberName"
                        >
                          Prescriber Name
                        </Text>
                        <TextField.Root
                          id="prescriberName"
                          value={formData.prescribedBy.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              prescribedBy: {
                                ...prev.prescribedBy,
                                name: e.target.value,
                              },
                            }))
                          }
                          placeholder="Enter prescriber name"
                          required
                        />
                      </Box>
                    </Grid>
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="instructions">
                      Administration Instructions
                    </Text>
                    <TextArea
                      id="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Give with food"
                    />
                  </Box>

                  <Box>
                    <Flex align="center" gap="2">
                      <input
                        type="checkbox"
                        id="reminderEnabled"
                        checked={formData.reminderEnabled}
                        onChange={handleChange}
                      />
                      <Text as="label" size="2" htmlFor="reminderEnabled">
                        Enable Reminders
                      </Text>
                    </Flex>
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Additional Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Medication"}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => router.push(`/pets/${petId}`)}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
              </form>
            )}
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="AddMedication">
        {addMedicationContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
